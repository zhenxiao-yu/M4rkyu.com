-- ============================================================
-- Media CMS — DB-backed mirror of src/content/media.ts.
-- Metadata-only (no storage bucket yet — posters/reels stay
-- deferred to a follow-up that wires the gallery-images bucket).
-- Public /media renders every status as a showcase lane, so the
-- SELECT policy exposes every row; writes stay admin-only.
-- ============================================================

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 100),
  title text not null check (char_length(title) between 1 and 160),
  format text not null check (format in ('video', 'reel', 'process', 'poster')),
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  description text not null default '' check (char_length(description) <= 1000),
  duration text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_items_sort_idx
  on public.media_items (sort_order, created_at desc);

drop trigger if exists media_items_touch_updated_at on public.media_items;
create trigger media_items_touch_updated_at
  before update on public.media_items
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
alter table public.media_items enable row level security;

drop policy if exists media_items_select on public.media_items;
create policy media_items_select on public.media_items
  for select using (true);

drop policy if exists media_items_admin_all on public.media_items;
create policy media_items_admin_all on public.media_items
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
