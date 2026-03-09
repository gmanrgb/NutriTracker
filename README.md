# NutriTrack - VibeCoded

NutriTrack is a Next.js nutrition tracker with:

- username/password auth (HTTP-only session cookies)
- daily diary + custom foods + goals APIs
- a cosmic dashboard experience at `/cosmic`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Initialize local SQLite + seed foods:

```bash
npm run db:setup
```

3. Start dev server:

```bash
npm run dev
```

4. Open `http://localhost:3000` and register/login.

## Production / Vercel Setup

Use a remote LibSQL/Turso database in production.

Required Vercel environment variables:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN` (if your Turso DB requires auth)

Optional (recommended for auth rate limits):

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional (for login-time weight handshake to Supabase):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_WEIGHT_TABLE` (default: `weight_logs`)
- `SUPABASE_WEIGHT_USER_COLUMN` (default: `user_id`)
- `SUPABASE_WEIGHT_VALUE_COLUMN` (default: `weight`)
- `SUPABASE_WEIGHT_UNIT_COLUMN` (default: `unit`)
- `SUPABASE_WEIGHT_DATE_COLUMN` (default: `logged_at`)

### Why this is required

Production on Vercel is serverless/ephemeral; local file DBs are not suitable.  
NutriTrack now enforces this at runtime and will fail fast if `TURSO_DATABASE_URL` is missing.

### DB schema in production

Run migrations against your Turso DB before first production use:

```bash
TURSO_DATABASE_URL="..." TURSO_AUTH_TOKEN="..." npm run db:setup
```

Then deploy to Vercel with the same DB env vars configured.

## Security Notes

- Never hardcode API keys in source files.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only; do not prefix it with `NEXT_PUBLIC_`.
- `.env.local` is ignored by git and should be used for local secrets.
- Passwords are hashed (Argon2) before storage, and session tokens are only stored as hashes in the DB.
