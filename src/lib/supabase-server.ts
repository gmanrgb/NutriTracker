import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const missingConfigError =
  'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.';

type SupabaseClientType = SupabaseClient<any, 'public', any>;

const unavailableSupabase = new Proxy(
  {},
  {
    get() {
      throw new Error(missingConfigError);
    },
  }
) as SupabaseClientType;

export const supabaseAdmin: SupabaseClientType =
  supabaseUrl && serviceRoleKey
    ? createClient<any>(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : unavailableSupabase;

export function assertSupabaseConfigured() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(missingConfigError);
  }
}

type SupabaseLikeError = {
  code?: string | null;
  message?: string | null;
} | null | undefined;

export function explainSupabaseError(
  error: SupabaseLikeError,
  fallback: string
): string {
  const code = (error?.code ?? '').toUpperCase();
  const message = (error?.message ?? '').toLowerCase();

  if (
    code === '42P01' ||
    (message.includes('relation') && message.includes('does not exist'))
  ) {
    return 'Supabase schema is missing. Run supabase/schema.sql in your Supabase project.';
  }

  if (code === '42501' || message.includes('permission denied')) {
    return 'Supabase credentials lack permissions. In Vercel, set SUPABASE_SERVICE_ROLE_KEY (not anon key).';
  }

  if (
    code === 'PGRST301' ||
    message.includes('jwt') ||
    message.includes('invalid api key') ||
    message.includes('invalid signature')
  ) {
    return 'Supabase credentials are invalid. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.';
  }

  return fallback;
}
