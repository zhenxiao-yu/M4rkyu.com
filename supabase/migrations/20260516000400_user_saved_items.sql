-- Saved/bookmarked items. Composite primary key prevents duplicate
-- saves of the same item by the same user. `item_key` is the stable
-- slug from src/content/* (all content types in this repo use `slug`
-- as their identifier — see src/content/schemas.ts).
--
-- Content is NOT duplicated into Supabase. The site renders saved
-- items by joining `(item_type, item_key)` against the in-code
-- content arrays. Content that is later removed or renamed will
-- appear as a tombstone tile on /account/saved.

create table if not exists public.user_saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_type text not null check (
    item_type in ('project', 'gallery', 'log', 'game', 'resource', 'note')
  ),
  item_key text not null check (char_length(item_key) between 1 and 200),
  saved_at timestamptz not null default now(),
  primary key (user_id, item_type, item_key)
);

create index if not exists user_saved_items_user_recency_idx
  on public.user_saved_items (user_id, saved_at desc);
