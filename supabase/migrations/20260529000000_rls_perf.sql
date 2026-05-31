-- RLS performance pass: wrap auth.uid() and public.is_admin(auth.uid())
-- calls in (select …) so Postgres evaluates them ONCE per query via
-- an initplan instead of re-evaluating per row. Same semantics, but
-- 5-10x faster on small tables and 100x+ on growth.
--
-- Reference:
-- https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations
--
-- Pure ALTER — no policy creates, drops, or permission changes. Re-runs
-- are a no-op since the wrapped form is idempotent.

-- ── public.profiles ────────────────────────────────────────────────

alter policy profiles_select on public.profiles
  using (
    public_profile = true
    or id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

alter policy profiles_update_self on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy profiles_update_admin on public.profiles
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

alter policy profiles_delete on public.profiles
  using (
    id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

-- ── public.user_preferences ────────────────────────────────────────

alter policy user_preferences_select_self on public.user_preferences
  using (
    user_id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

alter policy user_preferences_insert_self on public.user_preferences
  with check (user_id = (select auth.uid()));

alter policy user_preferences_update_self on public.user_preferences
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy user_preferences_delete_self on public.user_preferences
  using (user_id = (select auth.uid()));

-- ── public.user_saved_items ────────────────────────────────────────

alter policy user_saved_items_select_self on public.user_saved_items
  using (
    user_id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

alter policy user_saved_items_insert_self on public.user_saved_items
  with check (user_id = (select auth.uid()));

alter policy user_saved_items_delete_self on public.user_saved_items
  using (user_id = (select auth.uid()));

-- ── public.comments ────────────────────────────────────────────────

alter policy comments_select on public.comments
  using (
    status = 'approved'
    or user_id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

alter policy comments_insert_self on public.comments
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
  );

alter policy comments_update_author on public.comments
  using (
    user_id = (select auth.uid())
    and status in ('pending', 'rejected', 'hidden')
  )
  with check (
    user_id = (select auth.uid())
  );

alter policy comments_update_admin on public.comments
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

alter policy comments_delete on public.comments
  using (
    user_id = (select auth.uid())
    or (select public.is_admin((select auth.uid())))
  );

-- ── public.admin_settings ──────────────────────────────────────────

alter policy admin_settings_select_admin on public.admin_settings
  using ((select public.is_admin((select auth.uid()))));

alter policy admin_settings_write_admin on public.admin_settings
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.gallery_collections ─────────────────────────────────────

alter policy gallery_collections_select on public.gallery_collections
  using (
    status = 'ready'
    or (select public.is_admin((select auth.uid())))
  );

alter policy gallery_collections_admin_all on public.gallery_collections
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.gallery_items ───────────────────────────────────────────

alter policy gallery_items_select on public.gallery_items
  using (
    status = 'ready'
    or (select public.is_admin((select auth.uid())))
  );

alter policy gallery_items_admin_all on public.gallery_items
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.projects ────────────────────────────────────────────────

alter policy projects_select on public.projects
  using (
    content_status = 'ready'
    or (select public.is_admin((select auth.uid())))
  );

alter policy projects_admin_all on public.projects
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.games ───────────────────────────────────────────────────

alter policy games_admin_all on public.games
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.media_items ─────────────────────────────────────────────

alter policy media_items_admin_all on public.media_items
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.resources ───────────────────────────────────────────────

alter policy resources_admin_all on public.resources
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.site_profile ────────────────────────────────────────────

alter policy site_profile_admin_all on public.site_profile
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.products ────────────────────────────────────────────────

alter policy products_admin_all on public.products
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.notes ───────────────────────────────────────────────────

alter policy notes_admin_all on public.notes
  using ((select public.is_admin((select auth.uid()))))
  with check ((select public.is_admin((select auth.uid()))));

-- ── public.orders ──────────────────────────────────────────────────

alter policy orders_select_own on public.orders
  using (
    (user_id is not null and user_id = (select auth.uid()))
    or (select public.is_admin((select auth.uid())))
  );

-- ── storage.objects · gallery-images bucket ────────────────────────

alter policy "gallery_images_admin_insert" on storage.objects
  with check (
    bucket_id = 'gallery-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "gallery_images_admin_update" on storage.objects
  using (
    bucket_id = 'gallery-images'
    and (select public.is_admin((select auth.uid())))
  )
  with check (
    bucket_id = 'gallery-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "gallery_images_admin_delete" on storage.objects
  using (
    bucket_id = 'gallery-images'
    and (select public.is_admin((select auth.uid())))
  );

-- ── storage.objects · content-images bucket ────────────────────────

alter policy "content_images_admin_insert" on storage.objects
  with check (
    bucket_id = 'content-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "content_images_admin_update" on storage.objects
  using (
    bucket_id = 'content-images'
    and (select public.is_admin((select auth.uid())))
  )
  with check (
    bucket_id = 'content-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "content_images_admin_delete" on storage.objects
  using (
    bucket_id = 'content-images'
    and (select public.is_admin((select auth.uid())))
  );

-- ── storage.objects · shop-images bucket ───────────────────────────

alter policy "shop_images_admin_insert" on storage.objects
  with check (
    bucket_id = 'shop-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "shop_images_admin_update" on storage.objects
  using (
    bucket_id = 'shop-images'
    and (select public.is_admin((select auth.uid())))
  )
  with check (
    bucket_id = 'shop-images'
    and (select public.is_admin((select auth.uid())))
  );

alter policy "shop_images_admin_delete" on storage.objects
  using (
    bucket_id = 'shop-images'
    and (select public.is_admin((select auth.uid())))
  );
