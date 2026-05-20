-- ============================================================
-- Site profile — single-row settings store for the /about + footer
-- profile object (src/content/profile.ts). The whole profile lives
-- as one JSONB blob validated by `profileSchema` in app code, so the
-- DB never drifts from the Zod contract and adding a profile field
-- needs no migration. Singleton enforced by `id = true` primary key.
-- Profile data is public, so SELECT is open; writes stay admin-only.
-- ============================================================

create table if not exists public.site_profile (
  id boolean primary key default true check (id),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_profile_touch_updated_at on public.site_profile;
create trigger site_profile_touch_updated_at
  before update on public.site_profile
  for each row execute function public.touch_updated_at();

-- ---- RLS ----
alter table public.site_profile enable row level security;

drop policy if exists site_profile_select on public.site_profile;
create policy site_profile_select on public.site_profile
  for select using (true);

drop policy if exists site_profile_admin_all on public.site_profile;
create policy site_profile_admin_all on public.site_profile
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
