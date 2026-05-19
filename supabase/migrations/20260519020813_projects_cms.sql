-- ============================================================
-- Projects CMS — DB-backed mirror of src/content/projects.ts.
-- Pure text content (no storage bucket); screenshots stay deferred
-- to a follow-up that wires them through the gallery-images bucket.
-- ============================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  short_pitch text not null default '' check (char_length(short_pitch) <= 600),
  category text not null check (category in (
    'web-app', 'game-dev', 'ai-tool', 'art-film', 'experiment', 'maintenance'
  )),
  year text not null check (char_length(year) between 1 and 16),
  status text not null check (status in ('ready', 'development', 'maintenance', 'archived', 'draft')),
  content_status text not null default 'draft' check (
    content_status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  featured boolean not null default false,
  problem text not null default '',
  solution text not null default '',
  role text not null default '',
  outcome text not null default '',
  stack text[] not null default '{}'::text[],
  features text[] not null default '{}'::text[],
  architecture_notes text[] not null default '{}'::text[],
  challenges text[] not null default '{}'::text[],
  lessons_learned text[] not null default '{}'::text[],
  next_steps text[] not null default '{}'::text[],
  live_url text,
  github_url text,
  cover_image_src text,
  cover_image_alt text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_sort_idx
  on public.projects (sort_order, created_at desc);

create index if not exists projects_public_idx
  on public.projects (content_status, featured, year, created_at desc)
  where content_status = 'ready';

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
-- Mirrors the gallery CMS pattern: public reads only ready content,
-- admin owns full CRUD.

alter table public.projects enable row level security;

drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
  for select using (
    content_status = 'ready'
    or public.is_admin(auth.uid())
  );

drop policy if exists projects_admin_all on public.projects;
create policy projects_admin_all on public.projects
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
