import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

function sanitizeFtsQuery(raw: string): string {
  // Remove FTS5 special characters and append * for prefix search
  const escaped = raw.replace(/["*^(){}[\]|&~,.:!?\\]/g, ' ').trim();
  if (!escaped) return '';
  // Wrap each word in quotes and add prefix wildcard
  return escaped
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `"${word}"*`)
    .join(' ');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const ftsQuery = sanitizeFtsQuery(q);
  if (!ftsQuery) {
    return NextResponse.json([]);
  }

  try {
    const result = await db.execute({
      sql: `SELECT f.id, f.name, f.brand, f.category, f.serving_size_g, f.serving_label,
                   f.calories, f.protein_g, f.carbs_g, f.fat_g, f.fiber_g, f.sugar_g,
                   f.saturated_fat_g, f.sodium_mg
            FROM foods_fts
            JOIN foods f ON f.rowid = foods_fts.rowid
            WHERE foods_fts MATCH ?
            LIMIT ?`,
      args: [ftsQuery, limit],
    });
    return NextResponse.json(result.rows);
  } catch {
    // Fallback to LIKE search if FTS query is malformed
    const likePattern = `%${q.replace(/%/g, '')}%`;
    const result = await db.execute({
      sql: `SELECT id, name, brand, category, serving_size_g, serving_label,
                   calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g,
                   saturated_fat_g, sodium_mg
            FROM foods
            WHERE name LIKE ? OR brand LIKE ?
            LIMIT ?`,
      args: [likePattern, likePattern, limit],
    });
    return NextResponse.json(result.rows);
  }
}
