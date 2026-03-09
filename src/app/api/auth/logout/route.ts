import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/crypto';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('session');
  if (cookie?.value) {
    const tokenHash = hashToken(cookie.value);
    await supabaseAdmin.from('sessions').delete().eq('token_hash', tokenHash);
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
