import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { DiaryEntryUpdateSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = DiaryEntryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { data: row, error: lookupError } = await supabaseAdmin
      .from('diary_entries')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Entry lookup failed' }, { status: 500 });
    }

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if ((row.user_id as string) !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('diary_entries')
      .update({ serving_qty: parsed.data.serving_qty })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    const { data: row, error: lookupError } = await supabaseAdmin
      .from('diary_entries')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: 'Entry lookup failed' }, { status: 500 });
    }

    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if ((row.user_id as string) !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin.from('diary_entries').delete().eq('id', id);
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
