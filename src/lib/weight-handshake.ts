type HandshakeStatus = 'connected' | 'not_configured' | 'not_found' | 'error';

export interface WeightHandshake {
  source: 'supabase';
  status: HandshakeStatus;
  latestWeight: number | null;
  unit: string | null;
  loggedAt: string | null;
  message?: string;
}

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
  table: string;
  userIdColumn: string;
  weightColumn: string;
  unitColumn: string;
  dateColumn: string;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;

  return {
    url: url.replace(/\/+$/, ''),
    serviceRoleKey,
    table: process.env.SUPABASE_WEIGHT_TABLE?.trim() || 'weight_logs',
    userIdColumn: process.env.SUPABASE_WEIGHT_USER_COLUMN?.trim() || 'user_id',
    weightColumn: process.env.SUPABASE_WEIGHT_VALUE_COLUMN?.trim() || 'weight',
    unitColumn: process.env.SUPABASE_WEIGHT_UNIT_COLUMN?.trim() || 'unit',
    dateColumn: process.env.SUPABASE_WEIGHT_DATE_COLUMN?.trim() || 'logged_at',
  };
}

export async function handshakeWeightTracking(userId: string): Promise<WeightHandshake> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    return {
      source: 'supabase',
      status: 'not_configured',
      latestWeight: null,
      unit: null,
      loggedAt: null,
      message: 'Supabase handshake not configured',
    };
  }

  const params = new URLSearchParams();
  params.set('select', `${cfg.weightColumn},${cfg.unitColumn},${cfg.dateColumn}`);
  params.set(cfg.userIdColumn, `eq.${userId}`);
  params.set('order', `${cfg.dateColumn}.desc`);
  params.set('limit', '1');

  const endpoint = `${cfg.url}/rest/v1/${cfg.table}?${params.toString()}`;

  let timeout: NodeJS.Timeout | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: cfg.serviceRoleKey,
        Authorization: `Bearer ${cfg.serviceRoleKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        source: 'supabase',
        status: 'error',
        latestWeight: null,
        unit: null,
        loggedAt: null,
        message: `Supabase request failed (${res.status})`,
      };
    }

    const rows = (await res.json()) as Array<Record<string, unknown>>;
    const row = rows?.[0];
    if (!row) {
      return {
        source: 'supabase',
        status: 'not_found',
        latestWeight: null,
        unit: null,
        loggedAt: null,
        message: 'No weight records found',
      };
    }

    const latestWeight = Number(row[cfg.weightColumn]);
    const unit = row[cfg.unitColumn];
    const loggedAt = row[cfg.dateColumn];

    return {
      source: 'supabase',
      status: 'connected',
      latestWeight: Number.isFinite(latestWeight) ? latestWeight : null,
      unit: typeof unit === 'string' ? unit : null,
      loggedAt: typeof loggedAt === 'string' ? loggedAt : null,
    };
  } catch {
    return {
      source: 'supabase',
      status: 'error',
      latestWeight: null,
      unit: null,
      loggedAt: null,
      message: 'Supabase handshake request failed',
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
