import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { GoalsSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { data, error } = await supabaseAdmin
      .from('goals')
      .select('calories, protein_g, carbs_g, fat_g')
      .eq('user_id', session.userId)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 });
    }
    return NextResponse.json(data ?? null);
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

    const { error: upsertError } = await supabaseAdmin.from('goals').upsert(
      {
        id: session.userId,
        user_id: session.userId,
        calories,
        protein_g,
        carbs_g,
        fat_g,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to update goals' }, { status: 500 });
    }

    const { data: updated, error: readError } = await supabaseAdmin
      .from('goals')
      .select('calories, protein_g, carbs_g, fat_g')
      .eq('user_id', session.userId)
      .maybeSingle();

    if (readError) {
      return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
