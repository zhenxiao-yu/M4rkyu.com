alter table public.user_preferences
  add column if not exists notification_last_seen_at timestamptz,
  add column if not exists browser_notifications boolean not null default false;
