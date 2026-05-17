-- ============================================================
-- Row-Level Security policies.
-- Default posture: deny everything; each table gets explicit
-- per-action policies. Admin checks call public.is_admin(auth.uid()).
-- ============================================================

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_saved_items enable row level security;
alter table public.comments enable row level security;
alter table public.admin_settings enable row level security;

-- ---- profiles ----

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select
  using (
    public_profile = true
    or id = auth.uid()
    or public.is_admin(auth.uid())
  );

-- INSERT is handled exclusively by the handle_new_user trigger
-- (security definer). No INSERT policy means direct inserts from
-- the client are rejected.

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Users can delete their own profile (account closure). Admins can
-- delete any profile. Note: deleting a profile cascades to saved
-- items, preferences, and own comments per FK rules.
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- ---- user_preferences ----

drop policy if exists user_preferences_select_self on public.user_preferences;
create policy user_preferences_select_self on public.user_preferences
  for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists user_preferences_insert_self on public.user_preferences;
create policy user_preferences_insert_self on public.user_preferences
  for insert with check (user_id = auth.uid());

drop policy if exists user_preferences_update_self on public.user_preferences;
create policy user_preferences_update_self on public.user_preferences
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists user_preferences_delete_self on public.user_preferences;
create policy user_preferences_delete_self on public.user_preferences
  for delete using (user_id = auth.uid());

-- ---- user_saved_items ----

drop policy if exists user_saved_items_select_self on public.user_saved_items;
create policy user_saved_items_select_self on public.user_saved_items
  for select using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists user_saved_items_insert_self on public.user_saved_items;
create policy user_saved_items_insert_self on public.user_saved_items
  for insert with check (user_id = auth.uid());

drop policy if exists user_saved_items_delete_self on public.user_saved_items;
create policy user_saved_items_delete_self on public.user_saved_items
  for delete using (user_id = auth.uid());

-- No UPDATE policy: saves are immutable rows; "edit" doesn't make
-- sense for a bookmark. The composite primary key already prevents
-- duplicate inserts.

-- ---- comments ----

-- Approved comments are world-readable. The author and admins see
-- every status. This is the only place where guests get a SELECT.
drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select using (
    status = 'approved'
    or user_id = auth.uid()
    or public.is_admin(auth.uid())
  );

drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self on public.comments
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    -- The auto_approve_admin_comments trigger may promote `pending`
    -- to `approved` before the row is committed; that runs BEFORE
    -- the with-check evaluation in Postgres so this remains safe.
  );

-- Authors can edit their own comments only while not yet approved.
-- Once a comment is approved we lock the body (or we'd let people
-- bait-and-switch their approved text).
drop policy if exists comments_update_author on public.comments;
create policy comments_update_author on public.comments
  for update
  using (
    user_id = auth.uid()
    and status in ('pending', 'rejected', 'hidden')
  )
  with check (
    user_id = auth.uid()
    -- Status changes are admin-only. Authors keep the row in its
    -- current status when they edit body.
    and status in ('pending', 'rejected', 'hidden')
  );

-- Admins can update anything (status changes, hide, etc).
drop policy if exists comments_update_admin on public.comments;
create policy comments_update_admin on public.comments
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete using (
    user_id = auth.uid() or public.is_admin(auth.uid())
  );

-- ---- admin_settings ----
-- Admin-only end-to-end. Public reads happen through SECURITY DEFINER
-- helpers if/when needed (none required by MVP code paths).

drop policy if exists admin_settings_select_admin on public.admin_settings;
create policy admin_settings_select_admin on public.admin_settings
  for select using (public.is_admin(auth.uid()));

drop policy if exists admin_settings_write_admin on public.admin_settings;
create policy admin_settings_write_admin on public.admin_settings
  for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
