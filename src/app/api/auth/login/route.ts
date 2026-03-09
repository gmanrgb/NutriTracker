import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateSessionToken, hashToken } from '@/lib/crypto';
import { LoginSchema } from '@/lib/schemas';
import { sessionCookieOptions } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit';
import { handshakeWeightTracking } from '@/lib/weight-handshake';
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { username, password } = parsed.data;

  const rl = await checkLoginRateLimit(username);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many login attempts' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) },
      }
    );
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  if (userError) {
    return NextResponse.json({ error: 'User lookup failed' }, { status: 500 });
  }

  const passwordHash = (user?.password_hash as string | undefined) ?? undefined;
  const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$placeholder';
  const isValid = user
    ? await verifyPassword(password, passwordHash ?? dummyHash)
    : (await verifyPassword(password, dummyHash), false);

  if (!user || !isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: insertSessionError } = await supabaseAdmin.from('sessions').insert({
    id: sessionId,
    user_id: user.id as string,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insertSessionError) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  const weightHandshake = await handshakeWeightTracking(user.id as string);
  const opts = sessionCookieOptions();
  const response = NextResponse.json({
    id: user.id,
    username: user.username,
    weightHandshake,
  });
  response.cookies.set(opts.name, rawToken, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return response;
}
