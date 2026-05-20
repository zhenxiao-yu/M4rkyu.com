-- ============================================================
-- Games CMS — DB-backed mirror of src/content/games.ts.
-- Mirrors the projects CMS pattern. Unlike projects, the public
-- /games surface intentionally renders draft / placeholder /
-- coming-soon entries as "archive lanes", so the SELECT policy
-- exposes every row publicly; writes stay admin-only.
-- ============================================================

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  engine text not null default '' check (char_length(engine) <= 120),
  year text not null default '' check (char_length(year) <= 16),
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  pitch text not null default '' check (char_length(pitch) <= 1200),
  role text not null default '' check (char_length(role) <= 600),
  notes text[] not null default '{}'::text[],
  cover_src text,
  cover_alt text not null default '' check (char_length(cover_alt) <= 240),
  trailer_url text,
  platforms text[] not null default '{}'::text[],
  pillars text[] not null default '{}'::text[],
  postmortem text not null default '',
  outcome text not null default '',
  build_links jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_sort_idx
  on public.games (sort_order, created_at desc);

drop trigger if exists games_touch_updated_at on public.games;
create trigger games_touch_updated_at
  before update on public.games
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
alter table public.games enable row level security;

drop policy if exists games_select on public.games;
create policy games_select on public.games
  for select using (true);

drop policy if exists games_admin_all on public.games;
create policy games_admin_all on public.games
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
