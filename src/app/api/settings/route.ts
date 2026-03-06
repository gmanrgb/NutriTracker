import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { SettingSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const result = await db.execute({
      sql: 'SELECT key, value FROM user_settings WHERE user_id = ?',
      args: [session.userId],
    });
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string;
    }
    return NextResponse.json(settings);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = SettingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const { key, value } = parsed.data;
    const id = crypto.randomUUID();

    await db.execute({
      sql: `INSERT INTO user_settings (id, user_id, key, value, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id, key) DO UPDATE SET
              value = excluded.value,
              updated_at = datetime('now')`,
      args: [id, session.userId, key, value],
    });

    return NextResponse.json({ key, value });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
