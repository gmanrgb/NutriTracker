import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { DiaryEntrySchema } from '@/lib/schemas';
import { sumDiary, type FoodData } from '@/lib/nutrition';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const entries = await db.execute({
      sql: `SELECT id, food_id, food_source, meal_slot, serving_qty
            FROM diary_entries
            WHERE user_id = ? AND date = ?
            ORDER BY created_at ASC`,
      args: [session.userId, date],
    });

    // Separate catalog and custom food IDs
    const catalogIds = entries.rows
      .filter((e) => e.food_source === 'catalog')
      .map((e) => e.food_id as string);
    const customIds = entries.rows
      .filter((e) => e.food_source === 'custom')
      .map((e) => e.food_id as string);

    const foodMap: Record<string, FoodData & { name: string; brand: string | null; serving_label: string }> = {};

    if (catalogIds.length > 0) {
      const placeholders = catalogIds.map(() => '?').join(',');
      const foods = await db.execute({
        sql: `SELECT id, name, brand, serving_label, calories, protein_g, carbs_g, fat_g
              FROM foods WHERE id IN (${placeholders})`,
        args: catalogIds,
      });
      for (const row of foods.rows) {
        foodMap[row.id as string] = {
          name: row.name as string,
          brand: row.brand as string | null,
          serving_label: row.serving_label as string,
          calories: row.calories as number,
          protein_g: row.protein_g as number,
          carbs_g: row.carbs_g as number,
          fat_g: row.fat_g as number,
        };
      }
    }

    if (customIds.length > 0) {
      const placeholders = customIds.map(() => '?').join(',');
      const foods = await db.execute({
        sql: `SELECT id, name, brand, serving_label, calories, protein_g, carbs_g, fat_g
              FROM custom_foods WHERE id IN (${placeholders}) AND user_id = ?`,
        args: [...customIds, session.userId],
      });
      for (const row of foods.rows) {
        foodMap[row.id as string] = {
          name: row.name as string,
          brand: row.brand as string | null,
          serving_label: row.serving_label as string,
          calories: row.calories as number,
          protein_g: row.protein_g as number,
          carbs_g: row.carbs_g as number,
          fat_g: row.fat_g as number,
        };
      }
    }

    const enrichedEntries = entries.rows.map((e) => {
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
      entries.rows.map((e) => ({
        food_id: e.food_id as string,
        food_source: e.food_source as string,
        serving_qty: e.serving_qty as number,
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

    // Verify food exists
    if (food_source === 'catalog') {
      const food = await db.execute({
        sql: 'SELECT id FROM foods WHERE id = ?',
        args: [food_id],
      });
      if (food.rows.length === 0) {
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }
    } else {
      const food = await db.execute({
        sql: 'SELECT id FROM custom_foods WHERE id = ? AND user_id = ?',
        args: [food_id, session.userId],
      });
      if (food.rows.length === 0) {
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }
    }

    const id = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO diary_entries (id, user_id, food_id, food_source, date, meal_slot, serving_qty)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, session.userId, food_id, food_source, date, meal_slot, serving_qty],
    });

    const created = await db.execute({
      sql: 'SELECT * FROM diary_entries WHERE id = ?',
      args: [id],
    });

    return NextResponse.json(created.rows[0], { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
