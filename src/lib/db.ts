import { createClient } from '@libsql/client';

const isVercelRuntime = process.env.VERCEL === '1';

const configuredUrl = process.env.TURSO_DATABASE_URL;
const fallbackLocalUrl = 'file:nutritrack.db';

const url = configuredUrl ?? fallbackLocalUrl;

if (isVercelRuntime && url.startsWith('file:')) {
  throw new Error(
    `Invalid Vercel database URL "${url}". Set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN when needed) to a remote LibSQL/Turso database.`
  );
}

const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});
