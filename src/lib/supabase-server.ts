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
