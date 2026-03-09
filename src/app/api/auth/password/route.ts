import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { PasswordChangeSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = PasswordChangeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { current_password, new_password } = parsed.data;

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', session.userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await verifyPassword(current_password, user.password_hash as string);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await hashPassword(new_password);
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', session.userId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
