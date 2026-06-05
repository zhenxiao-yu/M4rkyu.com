-- ============================================================
-- Project screenshots + product fields — the deferred follow-up
-- promised in 20260519020813_projects_cms.sql. Heavy screenshot
-- assets live in the existing `content-images` storage bucket
-- (admin write / public read, already created + policied); this
-- migration only adds the metadata table and the product-facing
-- columns on `projects`. All additive — existing rows untouched,
-- the public read path falls back to src/content/projects.ts when
-- the projects table is empty.
-- ============================================================

-- ---- product fields on projects ----
-- App-Store / README framing for the redesigned /work/[slug] page.
-- All nullable / defaulted so existing rows and the static fallback
-- validate unchanged.

alter table public.projects
  add column if not exists tagline text not null default '',
  add column if not exists timeline text not null default '',
  add column if not exists platforms text[] not null default '{}'::text[],
  -- stack_groups: [{ "group": "Frontend", "items": ["Next.js", "..."] }]
  add column if not exists stack_groups jsonb not null default '[]'::jsonb;

-- ---- project_screenshots table ----
-- One row per labeled screenshot. `path` points into the
-- content-images bucket (projects/<slug>/…); the public URL is
-- derived by contentImageUrlFor(). Ordered by sort_order.

create table if not exists public.project_screenshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
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

create index if not exists project_screenshots_project_idx
  on public.project_screenshots (project_id, sort_order, created_at);

-- updated_at trigger — reuse public.touch_updated_at().
drop trigger if exists project_screenshots_touch_updated_at on public.project_screenshots;
create trigger project_screenshots_touch_updated_at
  before update on public.project_screenshots
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
-- Public SELECT only when the parent project is publicly visible
-- (content_status = 'ready'); admin owns full CRUD. Mirrors the
-- gallery_items posture, gated through the parent row.

alter table public.project_screenshots enable row level security;

drop policy if exists project_screenshots_select on public.project_screenshots;
create policy project_screenshots_select on public.project_screenshots
  for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from public.projects p
      where p.id = project_screenshots.project_id
        and p.content_status = 'ready'
    )
  );

drop policy if exists project_screenshots_admin_all on public.project_screenshots;
create policy project_screenshots_admin_all on public.project_screenshots
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
