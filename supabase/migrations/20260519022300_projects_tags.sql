-- ============================================================
-- Add cross-cutting `tags` column to projects.
-- Distinct from `stack` (technologies) — tags express themes,
-- audiences, scope ("personal", "open-source", "in-production"),
-- and other surface-level groupings the /work filter UX can offer.
-- ============================================================

alter table public.projects
  add column if not exists tags text[] not null default '{}'::text[];

-- GIN index for any future tag-set queries (containment / overlap).
-- Cheap to maintain at this row count; cuts a filter by tag from
-- a sequential scan to an index lookup.
create index if not exists projects_tags_gin_idx
  on public.projects using gin (tags);
