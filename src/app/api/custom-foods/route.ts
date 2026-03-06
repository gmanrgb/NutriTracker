import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { CustomFoodSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const result = await db.execute({
      sql: `SELECT id, name, brand, category, serving_size_g, serving_label,
                   calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
                   saturated_fat_g, sodium_mg, created_at
            FROM custom_foods WHERE user_id = ? ORDER BY created_at DESC`,
      args: [session.userId],
    });
    return NextResponse.json(result.rows);
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

    await db.execute({
      sql: `INSERT INTO custom_foods
              (id, user_id, name, brand, category, serving_size_g, serving_label,
               calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg)
            VALUES (?, ?, ?, ?, 'custom', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, session.userId, d.name, d.brand ?? null, d.serving_size_g, d.serving_label,
        d.calories, d.protein_g, d.carbs_g, d.fat_g,
        d.fiber_g ?? null, d.sugar_g ?? null, d.saturated_fat_g ?? null, d.sodium_mg ?? null,
      ],
    });

    const created = await db.execute({
      sql: 'SELECT * FROM custom_foods WHERE id = ?',
      args: [id],
    });

    return NextResponse.json(created.rows[0], { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
