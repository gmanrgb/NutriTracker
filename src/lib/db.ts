import { createClient } from '@libsql/client';

const isVercelRuntime = process.env.VERCEL === '1';
const configuredUrl = process.env.TURSO_DATABASE_URL;
const fallbackLocalUrl = 'file:nutritrack.db';

// Do not default to local file DB on Vercel.
const url = configuredUrl ?? (isVercelRuntime ? undefined : fallbackLocalUrl);
const authToken = process.env.TURSO_AUTH_TOKEN;

const missingDbError =
  'Database is not configured. Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN when needed) for this environment.';

const unavailableDb = new Proxy(
  {},
  {
    get() {
      throw new Error(missingDbError);
    },
  }
) as ReturnType<typeof createClient>;

export const db = url
  ? createClient({
      url,
      ...(authToken ? { authToken } : {}),
    })
  : unavailableDb;
