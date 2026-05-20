-- ============================================================
-- Shop products CMS — DB-backed product catalog + image bucket.
-- Mirrors the static src/content/shop.ts shape so the public read
-- path (and checkout price resolution) can fall back to the static
-- array when the table is empty (zero-downtime cutover).
--
-- Money is integer minor units (cents), matching Stripe and the
-- static catalog. The DB is the server-side source of truth for
-- pricing once populated; the client only ever sends slug + quantity.
-- ============================================================

-- ---- table ----

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$' and char_length(slug) between 1 and 80),
  title text not null check (char_length(title) between 1 and 160),
  summary text not null check (char_length(summary) between 1 and 280),
  description text not null default '' check (char_length(description) <= 4000),
  category text not null check (char_length(category) between 1 and 80),
  kind text not null check (kind in ('physical', 'digital')),
  price_in_cents integer not null default 0 check (price_in_cents >= 0),
  currency text not null default 'usd' check (currency = 'usd'),
  image_path text,
  image_alt text not null default '' check (char_length(image_alt) <= 240),
  status text not null default 'placeholder' check (
    status in ('ready', 'draft', 'placeholder', 'coming-soon')
  ),
  featured boolean not null default false,
  in_stock boolean not null default true,
  tags text[] not null default '{}'::text[],
  digital_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_sort_idx
  on public.products (sort_order, created_at desc);

create index if not exists products_public_idx
  on public.products (status, featured, created_at desc)
  where status = 'ready';

-- updated_at trigger — reuse public.touch_updated_at().
drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
-- Public can SELECT only ready products (drafts/placeholders stay out
-- of the storefront + sitemap). Admin owns full CRUD.

alter table public.products enable row level security;

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select using (
    status = 'ready'
    or public.is_admin(auth.uid())
  );

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---- storage bucket ----
-- Public read so <img src> works without signed URLs. Admin-only write.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-images',
  'shop-images',
  true,
  10485760,  -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "shop_images_public_read" on storage.objects;
create policy "shop_images_public_read" on storage.objects
  for select using (bucket_id = 'shop-images');

drop policy if exists "shop_images_admin_insert" on storage.objects;
create policy "shop_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'shop-images'
    and public.is_admin(auth.uid())
  );

drop policy if exists "shop_images_admin_update" on storage.objects;
create policy "shop_images_admin_update" on storage.objects
  for update
  using (bucket_id = 'shop-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'shop-images' and public.is_admin(auth.uid()));

drop policy if exists "shop_images_admin_delete" on storage.objects;
create policy "shop_images_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'shop-images' and public.is_admin(auth.uid()));
