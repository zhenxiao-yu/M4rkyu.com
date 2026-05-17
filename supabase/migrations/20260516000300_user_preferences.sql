create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default false,
  theme_preference text check (theme_preference in ('light', 'dark', 'system')),
  locale_preference text check (locale_preference in ('en', 'zh')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
