import { NextRequest } from 'next/server';
import { hashToken } from './crypto';
import { assertSupabaseConfigured, supabaseAdmin } from './supabase-server';

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
  try {
    assertSupabaseConfigured();
  } catch (error) {
    throw new AuthError(error instanceof Error ? error.message : 'Supabase is not configured', 500);
  }

  const cookie = req.cookies.get('session');
  if (!cookie?.value) {
    throw new AuthError('Not authenticated');
  }

  const tokenHash = hashToken(cookie.value);

  const { data: sessionRow, error: sessionError } = await supabaseAdmin
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (sessionError) {
    throw new AuthError('Session lookup failed', 500);
  }

  if (!sessionRow) {
    throw new AuthError('Session expired or invalid');
  }

  const expiry = new Date(sessionRow.expires_at as string).getTime();
  if (!Number.isFinite(expiry) || expiry <= Date.now()) {
    throw new AuthError('Session expired or invalid');
  }

  const { data: userRow, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, username')
    .eq('id', sessionRow.user_id as string)
    .maybeSingle();

  if (userError) {
    throw new AuthError('User lookup failed', 500);
  }

  if (!userRow) {
    throw new AuthError('Session expired or invalid');
  }

  return {
    userId: userRow.id as string,
    username: userRow.username as string,
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
