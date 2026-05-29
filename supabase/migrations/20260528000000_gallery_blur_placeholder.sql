-- Gallery LQIP: store a tiny base64 blur placeholder per item so the
-- public gallery can show a blurred preview while the full image loads.
-- Generated client-side at upload (a ~16px canvas downscale), alongside
-- the width/height already captured. Nullable + additive: existing rows
-- and the static-content fallback keep working without it.

alter table public.gallery_items
  add column if not exists blur_data_url text;

comment on column public.gallery_items.blur_data_url is
  'Base64 data-URL LQIP placeholder captured at upload; fed to next/image placeholder="blur".';
