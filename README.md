# NutriTrack - VibeCoded

NutriTrack is a Next.js nutrition tracker with:

- username/password auth (Argon2 + HTTP-only session cookies)
- Supabase-backed API routes for foods, diary, goals, settings, and custom foods
- cosmic dashboard UI at `/cosmic`

## Environment Variables

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_WEIGHT_TABLE` (default `weight_logs`)
- `SUPABASE_WEIGHT_USER_COLUMN` (default `user_id`)
- `SUPABASE_WEIGHT_VALUE_COLUMN` (default `weight`)
- `SUPABASE_WEIGHT_UNIT_COLUMN` (default `unit`)
- `SUPABASE_WEIGHT_DATE_COLUMN` (default `logged_at`)

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Configure env vars above.
4. Seed base foods:

```bash
npm install
npm run db:setup
```

5. Start app:

```bash
npm run dev
```

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- No `NEXT_PUBLIC_` secret keys are used for server auth routes.
- Passwords are hashed; raw session tokens are not stored in DB (only token hash).
