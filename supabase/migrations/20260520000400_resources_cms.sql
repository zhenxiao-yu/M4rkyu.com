-- ============================================================
-- Resources CMS — DB-backed mirror of src/content/resources.ts.
-- Governs the card metadata for both external "link" resources and
-- in-house "tool" resources. The interactive tools themselves stay
-- code-owned in src/components/tools/ — this table only drives the
-- card chrome (name, description, why, link, tags, icon, status).
-- Public /resources filters to status='ready' in code; the SELECT
-- policy still exposes every row so admins preview drafts and the
-- code filter stays the single gate.
-- ============================================================

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 80),
  name text not null check (char_length(name) between 1 and 160),
  category text not null default '' check (char_length(category) <= 80),
  description text not null default '' check (char_length(description) <= 600),
  why text not null default '' check (char_length(why) <= 600),
  type text not null default 'link' check (type in ('link', 'tool')),
  link text not null check (char_length(link) between 1 and 2048),
  pricing text not null default '' check (char_length(pricing) <= 80),
  tags text[] not null default '{}'::text[],
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  featured boolean not null default false,
  icon_key text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_sort_idx
  on public.resources (sort_order, created_at desc);

create index if not exists resources_public_idx
  on public.resources (type, status, featured, created_at desc)
  where status = 'ready';

drop trigger if exists resources_touch_updated_at on public.resources;
create trigger resources_touch_updated_at
  before update on public.resources
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
alter table public.resources enable row level security;

drop policy if exists resources_select on public.resources;
create policy resources_select on public.resources
  for select using (true);

drop policy if exists resources_admin_all on public.resources;
create policy resources_admin_all on public.resources
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
