import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth';
import { SettingSchema } from '@/lib/schemas';
import { supabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const ALLOWED_SETTING_KEYS = [
  'dashboard.theme',
  'dashboard.units',
  'dashboard.waterGoal',
  'dashboard.mealNames',
  'dashboard.displayName',
  'dashboard.notificationsEnabled',
  'dashboard.notificationTime',
  'dashboard.mealWindows',
] as const;

const ALLOWED_SETTING_KEY_SET = new Set<string>(ALLOWED_SETTING_KEYS);
const ALLOWED_SETTING_KEY_LIST = Array.from(ALLOWED_SETTING_KEY_SET);

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('key, value')
      .eq('user_id', session.userId)
      .in('key', ALLOWED_SETTING_KEY_LIST);

    if (error) {
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }

    const settings: Record<string, string> = {};
    for (const row of data ?? []) {
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
    if (!ALLOWED_SETTING_KEY_SET.has(key)) {
      return NextResponse.json({ error: 'Unsupported setting key' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('user_settings').upsert(
      {
        id: `${session.userId}:${key}`,
        user_id: session.userId,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,key' }
    );

    if (error) {
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json({ key, value });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
