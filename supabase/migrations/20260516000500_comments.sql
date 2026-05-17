-- Comments default to `pending` for moderation-first safety.
-- Admin comments auto-approve via the insert trigger in
-- 20260516_010_functions_triggers.sql. Flat threading in MVP
-- (`parent_id` is stored but the UI doesn't nest), so a future
-- "Show replies" feature can ship without a migration.
--
-- Body is plain text, stored verbatim. The render path escapes
-- it as text — no HTML, no MDX, no link auto-detection. This is
-- the cheapest XSS posture and matches the §18 "no fabricated
-- engagement" tone the gallery social spec set out.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.comments(id) on delete cascade,
  item_type text not null check (
    item_type in ('project', 'gallery', 'log', 'game', 'note')
  ),
  item_key text not null check (char_length(item_key) between 1 and 200),
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'hidden')
  ),
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_item_thread_idx
  on public.comments (item_type, item_key, status, created_at desc);

create index if not exists comments_user_recency_idx
  on public.comments (user_id, created_at desc);

-- Partial index for the moderation queue. Most queries look at
-- pending; an unconditional index would balloon for no benefit.
create index if not exists comments_pending_idx
  on public.comments (created_at desc)
  where status = 'pending';
