-- ============================================================
-- Gallery CMS — DB-backed collections + items + storage bucket.
-- Mirrors the static src/content/gallery.ts shape so the public
-- read path can fall back to the static array when the table is
-- empty (zero-downtime cutover).
-- ============================================================

-- ---- tables ----

create table if not exists public.gallery_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 80),
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 600),
  cover_path text,
  cover_alt text not null default '' check (char_length(cover_alt) <= 200),
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  sort_order integer not null default 0,
  featured boolean not null default false,
  mood text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.gallery_collections(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 100),
  title text not null check (char_length(title) between 1 and 160),
  caption text not null default '' check (char_length(caption) <= 1000),
  type text not null check (type in ('image', 'contact-sheet', 'process')),
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  storage_path text,
  alt text not null default '' check (char_length(alt) <= 240),
  width integer,
  height integer,
  aspect text not null default '4/5' check (aspect in ('1/1','4/5','3/4','2/3','16/9','21/9')),
  captured_at text,
  location text,
  mood text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  featured boolean not null default false,
  pinned boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection_id, slug)
);

create index if not exists gallery_collections_sort_idx
  on public.gallery_collections (sort_order, created_at desc);

create index if not exists gallery_items_collection_idx
  on public.gallery_items (collection_id, sort_order, created_at desc);

create index if not exists gallery_items_public_idx
  on public.gallery_items (status, featured, pinned, created_at desc)
  where status = 'ready';

-- updated_at triggers — reuse public.touch_updated_at() from 20260516001000.
drop trigger if exists gallery_collections_touch_updated_at on public.gallery_collections;
create trigger gallery_collections_touch_updated_at
  before update on public.gallery_collections
  for each row execute function public.touch_updated_at();

drop trigger if exists gallery_items_touch_updated_at on public.gallery_items;
create trigger gallery_items_touch_updated_at
  before update on public.gallery_items
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
-- Public can SELECT only ready content. Admin owns full CRUD on
-- everything. Mirrors the comments table pattern.

alter table public.gallery_collections enable row level security;
alter table public.gallery_items enable row level security;

drop policy if exists gallery_collections_select on public.gallery_collections;
create policy gallery_collections_select on public.gallery_collections
  for select using (
    status = 'ready'
    or public.is_admin(auth.uid())
  );

drop policy if exists gallery_collections_admin_all on public.gallery_collections;
create policy gallery_collections_admin_all on public.gallery_collections
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists gallery_items_select on public.gallery_items;
create policy gallery_items_select on public.gallery_items
  for select using (
    status = 'ready'
    or public.is_admin(auth.uid())
  );

drop policy if exists gallery_items_admin_all on public.gallery_items;
create policy gallery_items_admin_all on public.gallery_items
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- storage bucket ----
-- Public read so <img src> works without signed URLs. Authenticated
-- write gated to admins via per-action storage.objects policies.
-- Bucket creation is idempotent; on re-run the on-conflict do-update
-- keeps the public flag / size limit / MIME filter in sync with this
-- migration (Supabase storage uses regular rows under the hood).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-images',
  'gallery-images',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gallery_images_public_read" on storage.objects;
create policy "gallery_images_public_read" on storage.objects
  for select using (bucket_id = 'gallery-images');

drop policy if exists "gallery_images_admin_insert" on storage.objects;
create policy "gallery_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'gallery-images'
    and public.is_admin(auth.uid())
  );

drop policy if exists "gallery_images_admin_update" on storage.objects;
create policy "gallery_images_admin_update" on storage.objects
  for update
  using (bucket_id = 'gallery-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'gallery-images' and public.is_admin(auth.uid()));

drop policy if exists "gallery_images_admin_delete" on storage.objects;
create policy "gallery_images_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'gallery-images' and public.is_admin(auth.uid()));
