import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { GoalsSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const result = await db.execute({
      sql: 'SELECT calories, protein_g, carbs_g, fat_g FROM goals WHERE user_id = ?',
      args: [session.userId],
    });
    return NextResponse.json(result.rows[0] ?? null);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = GoalsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { calories, protein_g, carbs_g, fat_g } = parsed.data;
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO goals (id, user_id, calories, protein_g, carbs_g, fat_g, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
              calories = excluded.calories,
              protein_g = excluded.protein_g,
              carbs_g = excluded.carbs_g,
              fat_g = excluded.fat_g,
              updated_at = datetime('now')`,
      args: [id, session.userId, calories, protein_g, carbs_g, fat_g],
    });

    const updated = await db.execute({
      sql: 'SELECT calories, protein_g, carbs_g, fat_g FROM goals WHERE user_id = ?',
      args: [session.userId],
    });

    return NextResponse.json(updated.rows[0]);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
