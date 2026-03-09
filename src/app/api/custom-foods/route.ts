import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { CustomFoodSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { data, error } = await supabaseAdmin
      .from('custom_foods')
      .select(
        'id, name, brand, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg, created_at'
      )
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to load custom foods' }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
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

    const parsed = CustomFoodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const d = parsed.data;
    const id = crypto.randomUUID();
    const payload = {
      id,
      user_id: session.userId,
      name: d.name,
      brand: d.brand ?? null,
      category: 'custom',
      serving_size_g: d.serving_size_g,
      serving_label: d.serving_label,
      calories: d.calories,
      protein_g: d.protein_g,
      carbs_g: d.carbs_g,
      fat_g: d.fat_g,
      fiber_g: d.fiber_g ?? null,
      sugar_g: d.sugar_g ?? null,
      saturated_fat_g: d.saturated_fat_g ?? null,
      sodium_mg: d.sodium_mg ?? null,
    };

    const { data, error } = await supabaseAdmin
      .from('custom_foods')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create custom food' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
