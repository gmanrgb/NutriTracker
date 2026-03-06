import { NextRequest } from 'next/server';
import { db } from './db';
import { hashToken } from './crypto';

export interface SessionUser {
  userId: string;
  username: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAuth(req: NextRequest): Promise<SessionUser> {
  const cookie = req.cookies.get('session');
  if (!cookie?.value) {
    throw new AuthError('Not authenticated');
  }

  const tokenHash = hashToken(cookie.value);
  const result = await db.execute({
    sql: `SELECT s.user_id, u.username
          FROM sessions s
          JOIN users u ON u.id = s.user_id
          WHERE s.token_hash = ? AND s.expires_at > datetime('now')`,
    args: [tokenHash],
  });

  const row = result.rows[0];
  if (!row) {
    throw new AuthError('Session expired or invalid');
  }

  return {
    userId: row.user_id as string,
    username: row.username as string,
  };
}

export function sessionCookieOptions(maxAge: number = 60 * 60 * 24 * 30) {
  return {
    name: 'session',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}
