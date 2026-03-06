import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db.execute({
    sql: `SELECT id, name, brand, category, serving_size_g, serving_label,
                 calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
                 saturated_fat_g, sodium_mg
          FROM foods WHERE id = ?`,
    args: [id],
  });

  const food = result.rows[0];
  if (!food) {
    return NextResponse.json({ error: 'Food not found' }, { status: 404 });
  }

  return NextResponse.json(food);
}
