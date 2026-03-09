import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    const { data: food, error: lookupError } = await supabaseAdmin
      .from('custom_foods')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
    }

    if (!food) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if ((food.user_id as string) !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin.from('custom_foods').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
