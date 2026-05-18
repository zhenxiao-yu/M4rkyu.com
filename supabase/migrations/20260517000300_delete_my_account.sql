-- Account deletion as an RPC the signed-in user can call.
--
-- Modern privacy requirement (and a GDPR-aligned baseline): the
-- account holder needs a one-button "delete my account" path that
-- doesn't require the service-role key on the server. We expose this
-- as a `security definer` function granted to the `authenticated`
-- role only — anonymous callers cannot invoke it, and the function
-- itself checks `auth.uid()` to scope the delete to the caller.
--
-- The cascade chain wipes:
--   - auth.users row (deleted directly here)
--   - public.profiles  (FK references auth.users on delete cascade)
--   - public.user_preferences  (same)
--   - public.user_saved_items  (same)
-- Comments authored by the user retain the row but anonymise the
-- author (FK is `on delete set null`), so moderation history stays
-- consistent and other users' replies don't disappear.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  delete from auth.users where id = uid;
end;
$$;

-- Lock the function down to signed-in callers only. `revoke from
-- public` makes the explicit `grant to authenticated` the only path
-- in; `anon` and unauthenticated requests will get a permission
-- error rather than executing.
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
