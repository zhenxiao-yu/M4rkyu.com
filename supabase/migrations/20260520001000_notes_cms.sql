-- ============================================================
-- Notes CMS — a personal microblog feed at /notes (a "persona X
-- account"): dated short posts of five kinds — update, repost, note,
-- review, tierlist. DB-backed mirror of src/content/notes.ts.
--
-- Kind-specific columns (link_url/label, rating, tiers) stay nullable so
-- a plain update carries no review/tierlist baggage. The public feed
-- shows only status = 'ready'; the SELECT policy stays open and the app
-- filters, matching the rest of the content CMS. Writes are admin-only.
-- ============================================================

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 100),
  kind text not null default 'note' check (
    kind in ('update', 'repost', 'note', 'review', 'tierlist')
  ),
  title text not null default '' check (char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 8000),
  status text not null default 'draft' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  tags text[] not null default '{}',
  published_at timestamptz not null default now(),
  -- repost / review source link
  link_url text,
  link_label text,
  -- review rating, 0–5 (null = not a review / unrated)
  rating smallint check (rating is null or (rating between 0 and 5)),
  -- tierlist rows authored as one tier per line ("S: a, b") — parsed app-side
  tiers text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Feed order: manual pin first (sort_order, all 0 by default), then
-- newest published, then newest created as the final tiebreak.
create index if not exists notes_feed_idx
  on public.notes (sort_order, published_at desc, created_at desc);

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
alter table public.notes enable row level security;

drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes
  for select using (true);

drop policy if exists notes_admin_all on public.notes;
create policy notes_admin_all on public.notes
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
