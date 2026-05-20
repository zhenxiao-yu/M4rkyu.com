-- ============================================================
-- Content images — a shared Storage bucket plus cover/poster columns
-- for the projects + media CMS, so admins can upload real visuals and
-- retire the placeholder frames on /work and /media.
--
-- One bucket ('content-images') with slug-prefixed paths keeps projects
-- and media tidy without a bucket each. Public read so <img src> works
-- without signed URLs; writes are admin-only.
-- ============================================================

-- ---- columns ----

alter table public.projects
  add column if not exists cover_path text;

alter table public.media_items
  add column if not exists poster_path text,
  add column if not exists poster_alt text not null default '';

-- ---- storage bucket ----

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "content_images_public_read" on storage.objects;
create policy "content_images_public_read" on storage.objects
  for select using (bucket_id = 'content-images');

drop policy if exists "content_images_admin_insert" on storage.objects;
create policy "content_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'content-images'
    and public.is_admin(auth.uid())
  );

drop policy if exists "content_images_admin_update" on storage.objects;
create policy "content_images_admin_update" on storage.objects
  for update
  using (bucket_id = 'content-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'content-images' and public.is_admin(auth.uid()));

drop policy if exists "content_images_admin_delete" on storage.objects;
create policy "content_images_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'content-images' and public.is_admin(auth.uid()));
