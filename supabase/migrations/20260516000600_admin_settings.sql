-- Tiny key/value bag for admin-editable settings. Used for
-- author-controlled overrides that don't justify a full table —
-- e.g. "is the comment system globally enabled today" or
-- "which gallery frame is currently pinned."
--
-- Seeded with defaults in supabase/seed.sql.

create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
