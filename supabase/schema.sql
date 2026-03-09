-- NutriTrack Supabase schema
-- Run this in Supabase SQL Editor before `npm run db:setup`

create table if not exists public.foods (
  id text primary key,
  name text not null,
  brand text,
  category text not null,
  serving_size_g double precision not null,
  serving_label text not null,
  calories double precision not null,
  protein_g double precision not null,
  carbs_g double precision not null,
  fat_g double precision not null,
  fiber_g double precision,
  sugar_g double precision,
  saturated_fat_g double precision,
  sodium_mg double precision,
  barcode text,
  created_at timestamptz not null default now()
);

create index if not exists idx_foods_name on public.foods (name);
create index if not exists idx_foods_brand on public.foods (brand);
create index if not exists idx_foods_barcode on public.foods (barcode);

create table if not exists public.users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user on public.sessions (user_id);
create index if not exists idx_sessions_token on public.sessions (token_hash);

create table if not exists public.custom_foods (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  name text not null,
  brand text,
  category text not null default 'custom',
  serving_size_g double precision not null,
  serving_label text not null,
  calories double precision not null,
  protein_g double precision not null,
  carbs_g double precision not null,
  fat_g double precision not null,
  fiber_g double precision,
  sugar_g double precision,
  saturated_fat_g double precision,
  sodium_mg double precision,
  created_at timestamptz not null default now()
);

create index if not exists idx_custom_foods_user on public.custom_foods (user_id);

create table if not exists public.diary_entries (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  food_id text not null,
  food_source text not null check (food_source in ('catalog', 'custom')),
  date date not null,
  meal_slot text not null check (meal_slot in ('breakfast', 'lunch', 'dinner', 'snack')),
  serving_qty double precision not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_diary_entries_user_date on public.diary_entries (user_id, date);
create index if not exists idx_diary_entries_food on public.diary_entries (food_id);

create table if not exists public.goals (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  calories double precision not null,
  protein_g double precision not null,
  carbs_g double precision not null,
  fat_g double precision not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

create index if not exists idx_user_settings_user on public.user_settings (user_id);

create table if not exists public.weight_logs (
  id bigint generated always as identity primary key,
  user_id text not null references public.users(id) on delete cascade,
  weight double precision not null,
  unit text not null default 'lb',
  logged_at timestamptz not null default now()
);

create index if not exists idx_weight_logs_user_date on public.weight_logs (user_id, logged_at desc);
