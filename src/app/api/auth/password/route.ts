import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/crypto';
import { PasswordChangeSchema } from '@/lib/schemas';

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

    const result = await db.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [session.userId],
    });

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await verifyPassword(current_password, user.password_hash as string);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await hashPassword(new_password);
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [newHash, session.userId],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}
