import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

function sanitizeLike(raw: string): string {
  return raw.replace(/[%_]/g, '').trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const clean = sanitizeLike(q);
  if (!clean) return NextResponse.json([]);

  const likePattern = `%${clean}%`;

  const { data, error } = await supabaseAdmin
    .from('foods')
    .select(
      'id, name, brand, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg'
    )
    .or(`name.ilike.${likePattern},brand.ilike.${likePattern}`)
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Food search failed' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
