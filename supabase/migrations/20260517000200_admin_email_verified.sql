-- Harden the admin promotion path.
--
-- The owner-email allowlist in 20260517000100 promoted any new
-- auth.users row whose email matched the list — without checking
-- whether the email was actually verified by the provider. With a
-- misconfigured Google/GitHub OAuth app (or any provider that returns
-- an unverified primary email) an attacker who claims an allowlisted
-- email on their own account could land in the admin role on first
-- sign-in.
--
-- Fix: only promote when `email_confirmed_at IS NOT NULL`. Anything
-- else stays a regular user; the author can hand-promote via SQL if
-- the verification gate misfires. The defensive backfill at the end
-- of the previous migration is left intact because it scopes to rows
-- that already passed the (verified) is_admin assertion — but we
-- re-run it here under the new guard to be belt-and-suspenders safe.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_display_name text;
  meta_avatar_url text;
  is_verified_owner boolean;
begin
  meta_display_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'user_name',
    split_part(new.email, '@', 1)
  );
  meta_avatar_url := new.raw_user_meta_data ->> 'avatar_url';

  -- Owner role requires BOTH an allowlisted email AND a confirmed
  -- email timestamp. Providers that don't verify (e.g. some custom
  -- OAuth provider misconfig, or signup-without-confirmation) land
  -- as regular users.
  is_verified_owner := public.is_owner_email(new.email)
    and new.email_confirmed_at is not null;

  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    nullif(meta_display_name, ''),
    nullif(meta_avatar_url, ''),
    case when is_verified_owner then 'admin' else 'user' end
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Re-assert admin role for already-verified owners. Same scoping as
-- before, plus the email_confirmed_at gate. Wrapped in the same
-- disable/enable dance around the role-protection trigger so the
-- update doesn't trip the 42501 guard.
alter table public.profiles disable trigger profiles_protect_role;

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and public.is_owner_email(u.email)
  and u.email_confirmed_at is not null
  and p.role is distinct from 'admin';

alter table public.profiles enable trigger profiles_protect_role;
