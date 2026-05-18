-- Tighten direct RPC execution grants after advisor review.
--
-- `handle_new_user()` is only an auth.users trigger helper. It should
-- not be callable through PostgREST by either guests or signed-in
-- users.
--
-- `delete_my_account()` intentionally remains callable by
-- authenticated users, but anonymous callers do not need execute
-- permission even though the function also checks auth.uid().

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.delete_my_account() from anon;
