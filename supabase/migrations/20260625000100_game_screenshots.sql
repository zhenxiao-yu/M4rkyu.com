-- ============================================================
-- game_screenshots — mirror of project_screenshots so game detail
-- pages can read shots from the DB once games cut over to
-- DB-as-source-of-truth. `path` points into the content-images
-- bucket (or a /public passthrough path on imported content);
-- the public URL is derived by contentImageUrlFor(). Additive —
-- existing rows untouched; the static fallback in
-- src/content/games.ts still serves until the games table is seeded.
-- ============================================================

create table if not exists public.game_screenshots (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  path text not null check (char_length(path) between 1 and 400),
  alt text not null default '' check (char_length(alt) <= 240),
  label text not null default '' check (char_length(label) <= 120),
  caption text not null default '' check (char_length(caption) <= 1000),
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists game_screenshots_game_idx
  on public.game_screenshots (game_id, sort_order, created_at);

-- updated_at trigger — reuse public.touch_updated_at().
drop trigger if exists game_screenshots_touch_updated_at on public.game_screenshots;
create trigger game_screenshots_touch_updated_at
  before update on public.game_screenshots
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
-- Public SELECT only when the parent game is publicly visible
-- (status = 'ready'); admin owns full CRUD. Mirrors
-- project_screenshots, gated through the parent row.

alter table public.game_screenshots enable row level security;

drop policy if exists game_screenshots_select on public.game_screenshots;
create policy game_screenshots_select on public.game_screenshots
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.games g
      where g.id = game_screenshots.game_id
        and g.status = 'ready'
    )
  );

drop policy if exists game_screenshots_admin_all on public.game_screenshots;
create policy game_screenshots_admin_all on public.game_screenshots
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
