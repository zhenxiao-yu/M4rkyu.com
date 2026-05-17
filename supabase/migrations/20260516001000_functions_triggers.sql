-- ============================================================
-- Helper functions + triggers.
--
-- All functions are `security definer` only where they need to be
-- (cross-schema reads from auth). `is_admin` runs as the caller —
-- it just checks one row and RLS on `profiles` already permits any
-- signed-in user to read it (own row + public).
-- ============================================================

-- ---- updated_at touch trigger function ----
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists user_preferences_touch_updated_at on public.user_preferences;
create trigger user_preferences_touch_updated_at
  before update on public.user_preferences
  for each row execute function public.touch_updated_at();

drop trigger if exists comments_touch_updated_at on public.comments;
create trigger comments_touch_updated_at
  before update on public.comments
  for each row execute function public.touch_updated_at();

drop trigger if exists admin_settings_touch_updated_at on public.admin_settings;
create trigger admin_settings_touch_updated_at
  before update on public.admin_settings
  for each row execute function public.touch_updated_at();

-- ---- is_admin(uuid) ----
-- Cheap admin check. Inlined into RLS policies on every
-- moderator-only path. Not `security definer` — RLS on `profiles`
-- already allows the caller to read their own row, and reads of the
-- target user are guarded by the profile select policy anyway.
create or replace function public.is_admin(check_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = check_user_id and role = 'admin'
  );
$$;

-- ---- handle_new_user() ----
-- Fires after Supabase Auth inserts an auth.users row (OAuth signin,
-- magic-link verification, etc). Creates the satellite profile row
-- with values populated from OAuth metadata when available.
--
-- This function MUST be `security definer` because the row it
-- writes lives in a table the new user does not yet have an
-- authenticated session for at the moment of insertion. Search path
-- is locked to public so a hostile schema can't shadow `profiles`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_display_name text;
  meta_avatar_url text;
begin
  meta_display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'user_name',
    split_part(new.email, '@', 1)
  );
  meta_avatar_url := new.raw_user_meta_data ->> 'avatar_url';

  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, nullif(meta_display_name, ''), nullif(meta_avatar_url, ''))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- protect_profile_role() ----
-- Only admins may change `role`. A regular user updating their own
-- profile can move every field except `role`. Enforced as a trigger
-- (rather than a column-level RLS policy) so we can produce a clear
-- error message instead of a silent no-op.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if old.role is distinct from new.role then
    if not public.is_admin(auth.uid()) then
      raise exception 'role can only be changed by an admin'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---- auto_approve_admin_comments() ----
-- Admin-authored comments skip the moderation queue. Keeps the
-- author from moderating themselves on every post.
create or replace function public.auto_approve_admin_comments()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is not null and public.is_admin(new.user_id) then
    new.status := 'approved';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_auto_approve_admin on public.comments;
create trigger comments_auto_approve_admin
  before insert on public.comments
  for each row execute function public.auto_approve_admin_comments();

-- ---- rate_limit_comments() ----
-- Postgres-level burst limit. Five comments per user per 60s window
-- aborts with a clear message. Upstash-grade rate-limit lands later
-- only if needed; this catches the obvious "paste a script in the
-- console" case for free.
create or replace function public.rate_limit_comments()
returns trigger
language plpgsql
as $$
declare
  recent_count int;
begin
  if new.user_id is null then
    return new;
  end if;

  select count(*) into recent_count
  from public.comments
  where user_id = new.user_id
    and created_at > now() - interval '60 seconds';

  if recent_count >= 5 then
    raise exception 'comment rate limit exceeded (5 per minute)'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit
  before insert on public.comments
  for each row execute function public.rate_limit_comments();
