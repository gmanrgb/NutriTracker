import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';
import { DiaryEntryUpdateSchema } from '@/lib/schemas';

export const runtime = 'nodejs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = DiaryEntryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }

    const entry = await db.execute({
      sql: 'SELECT user_id FROM diary_entries WHERE id = ?',
      args: [id],
    });

    const row = entry.rows[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.user_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.execute({
      sql: 'UPDATE diary_entries SET serving_qty = ? WHERE id = ?',
      args: [parsed.data.serving_qty, id],
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM diary_entries WHERE id = ?',
      args: [id],
    });

    return NextResponse.json(updated.rows[0]);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    const entry = await db.execute({
      sql: 'SELECT user_id FROM diary_entries WHERE id = ?',
      args: [id],
    });

    const row = entry.rows[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (row.user_id !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.execute({
      sql: 'DELETE FROM diary_entries WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
