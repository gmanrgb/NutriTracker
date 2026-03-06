import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(req);
    const { id } = await params;

    const result = await db.execute({
      sql: 'SELECT user_id FROM custom_foods WHERE id = ?',
      args: [id],
    });

    const food = result.rows[0];
    if (!food) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (food.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.execute({
      sql: 'DELETE FROM custom_foods WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
