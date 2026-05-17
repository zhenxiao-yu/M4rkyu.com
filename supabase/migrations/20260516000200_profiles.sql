-- Profiles are a 1:1 satellite to auth.users. The trigger in
-- 20260516_010_functions_triggers.sql creates a row on sign-up,
-- populating display_name / avatar_url from the OAuth metadata.
--
-- `role` is intentionally a plain text column with a check
-- constraint instead of a Postgres enum so the allowed-roles set
-- can be widened later without a migration of every dependent view.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique,
  display_name text,
  avatar_url text,
  website text,
  bio text,
  role text not null default 'user' check (role in ('user', 'admin')),
  public_profile boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_-]{3,24}$'),
  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) <= 60),
  constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 280),
  constraint profiles_website_length
    check (website is null or char_length(website) <= 200)
);

create index if not exists profiles_role_idx
  on public.profiles (role)
  where role = 'admin';
