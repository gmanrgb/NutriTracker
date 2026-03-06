import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/crypto';
import { RegisterSchema } from '@/lib/schemas';
import { checkRegisterRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
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

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();

  await db.execute({
    sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
    args: [id, username, passwordHash],
  });

  return NextResponse.json({ success: true, username }, { status: 201 });
}
