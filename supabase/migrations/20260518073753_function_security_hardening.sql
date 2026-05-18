-- Supabase advisor hardening:
-- - Pin search_path on helper functions so caller role settings cannot
--   affect function name resolution.
-- - `handle_new_user()` is an internal trigger helper, not a public
--   RPC. Revoke direct API execution while keeping trigger execution.
--
-- `delete_my_account()` and `record_email_send(text, text)` remain
-- executable by their intended roles because application code calls
-- them directly and both contain their own scoped checks.

alter function public.touch_updated_at()
  set search_path = public;

alter function public.is_admin(uuid)
  set search_path = public;

alter function public.protect_profile_role()
  set search_path = public;

alter function public.auto_approve_admin_comments()
  set search_path = public;

alter function public.rate_limit_comments()
  set search_path = public;

alter function public.is_owner_email(text)
  set search_path = public;

revoke all on function public.handle_new_user() from public;
