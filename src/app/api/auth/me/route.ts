import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, created_at')
      .eq('id', session.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ id: user.id, username: user.username, created_at: user.created_at });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
