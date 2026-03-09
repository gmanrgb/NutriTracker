import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: food, error } = await supabaseAdmin
    .from('foods')
    .select(
      'id, name, brand, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, sodium_mg'
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Food lookup failed' }, { status: 500 });
  }

  if (!food) {
    return NextResponse.json({ error: 'Food not found' }, { status: 404 });
  }

  return NextResponse.json(food);
}
