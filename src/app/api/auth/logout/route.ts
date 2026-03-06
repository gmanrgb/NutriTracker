import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashToken } from '@/lib/crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('session');
  if (cookie?.value) {
    const tokenHash = hashToken(cookie.value);
    await db.execute({
      sql: 'DELETE FROM sessions WHERE token_hash = ?',
      args: [tokenHash],
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return response;
}
