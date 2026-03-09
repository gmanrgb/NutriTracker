import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/crypto';
import { RegisterSchema } from '@/lib/schemas';
import { checkRegisterRateLimit } from '@/lib/rate-limit';
import { assertSupabaseConfigured, supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    assertSupabaseConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Supabase is not configured' },
      { status: 500 }
    );
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const rl = await checkRegisterRateLimit(ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const { username, password } = parsed.data;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  const { error: insertError } = await supabaseAdmin.from('users').insert({
    id,
    username,
    password_hash: passwordHash,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }

  return NextResponse.json({ success: true, username }, { status: 201 });
}
