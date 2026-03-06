import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateSessionToken, hashToken } from '@/lib/crypto';
import { LoginSchema } from '@/lib/schemas';
import { sessionCookieOptions } from '@/lib/auth';
import { checkLoginRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
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

  const result = await db.execute({
    sql: 'SELECT id, username, password_hash FROM users WHERE username = ?',
    args: [username],
  });

  const user = result.rows[0];
  const passwordHash = user?.password_hash as string | undefined;

  // Always run verify to prevent timing attacks
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

  await db.execute({
    sql: 'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    args: [sessionId, user.id as string, tokenHash, expiresAt],
  });

  const opts = sessionCookieOptions();
  const response = NextResponse.json({ id: user.id, username: user.username });
  response.cookies.set(opts.name, rawToken, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });

  return response;
}
