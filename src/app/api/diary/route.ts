import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { DiaryEntrySchema } from '@/lib/schemas';
import { sumDiary, type FoodData } from '@/lib/nutrition';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('diary_entries')
      .select('id, food_id, food_source, meal_slot, serving_qty')
      .eq('user_id', session.userId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (entriesError) {
      return NextResponse.json({ error: 'Failed to load diary entries' }, { status: 500 });
    }

    const rows = entries ?? [];

    const catalogIds = rows
      .filter((e) => e.food_source === 'catalog')
      .map((e) => e.food_id as string);
    const customIds = rows
      .filter((e) => e.food_source === 'custom')
      .map((e) => e.food_id as string);

    const foodMap: Record<string, FoodData & { name: string; brand: string | null; serving_label: string }> = {};

    if (catalogIds.length > 0) {
      const { data: foods, error: foodsError } = await supabaseAdmin
        .from('foods')
        .select('id, name, brand, serving_label, calories, protein_g, carbs_g, fat_g')
        .in('id', catalogIds);
      if (foodsError) {
        return NextResponse.json({ error: 'Failed to load catalog foods' }, { status: 500 });
      }
      for (const row of foods ?? []) {
        foodMap[row.id as string] = {
          name: row.name as string,
          brand: (row.brand as string | null) ?? null,
          serving_label: row.serving_label as string,
          calories: Number(row.calories),
          protein_g: Number(row.protein_g),
          carbs_g: Number(row.carbs_g),
          fat_g: Number(row.fat_g),
        };
      }
    }

    if (customIds.length > 0) {
      const { data: foods, error: customFoodsError } = await supabaseAdmin
        .from('custom_foods')
        .select('id, name, brand, serving_label, calories, protein_g, carbs_g, fat_g')
        .eq('user_id', session.userId)
        .in('id', customIds);
      if (customFoodsError) {
        return NextResponse.json({ error: 'Failed to load custom foods' }, { status: 500 });
      }
      for (const row of foods ?? []) {
        foodMap[row.id as string] = {
          name: row.name as string,
          brand: (row.brand as string | null) ?? null,
          serving_label: row.serving_label as string,
          calories: Number(row.calories),
          protein_g: Number(row.protein_g),
          carbs_g: Number(row.carbs_g),
          fat_g: Number(row.fat_g),
        };
      }
    }

    const enrichedEntries = rows.map((e) => {
      const food = foodMap[e.food_id as string];
      return {
        id: e.id,
        food_id: e.food_id,
        food_source: e.food_source,
        meal_slot: e.meal_slot,
        serving_qty: e.serving_qty,
        food: food ?? null,
      };
    });

    const totals = sumDiary(
      rows.map((e) => ({
        food_id: e.food_id as string,
        food_source: e.food_source as string,
        serving_qty: Number(e.serving_qty),
      })),
      foodMap
    );

    return NextResponse.json({ entries: enrichedEntries, totals });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = DiaryEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { food_id, food_source, date, meal_slot, serving_qty } = parsed.data;

    if (food_source === 'catalog') {
      const { data: food, error } = await supabaseAdmin
        .from('foods')
        .select('id')
        .eq('id', food_id)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: 'Food lookup failed' }, { status: 500 });
      }
      if (!food) {
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }
    } else {
      const { data: food, error } = await supabaseAdmin
        .from('custom_foods')
        .select('id')
        .eq('id', food_id)
        .eq('user_id', session.userId)
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: 'Food lookup failed' }, { status: 500 });
      }
      if (!food) {
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }
    }

    const id = crypto.randomUUID();
    const { data: created, error: insertError } = await supabaseAdmin
      .from('diary_entries')
      .insert({
        id,
        user_id: session.userId,
        food_id,
        food_source,
        date,
        meal_slot,
        serving_qty,
      })
      .select('*')
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create diary entry' }, { status: 500 });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
