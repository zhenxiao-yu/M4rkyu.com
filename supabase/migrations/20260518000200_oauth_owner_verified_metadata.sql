-- OAuth providers such as Google can insert auth.users before
-- `email_confirmed_at` is populated, while still providing verified
-- provider metadata (`raw_user_meta_data.email_verified = true`).
-- Treat that provider assertion as verified for the owner allowlist
-- so known owner emails keep admin role when they first sign in with
-- OAuth.

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

  is_verified_owner := public.is_owner_email(new.email)
    and (
      new.email_confirmed_at is not null
      or coalesce((new.raw_user_meta_data ->> 'email_verified')::boolean, false)
    );

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

alter table public.profiles disable trigger profiles_protect_role;

update public.profiles p
set role = 'admin'
from auth.users u
where u.id = p.id
  and public.is_owner_email(u.email)
  and (
    u.email_confirmed_at is not null
    or coalesce((u.raw_user_meta_data ->> 'email_verified')::boolean, false)
  )
  and p.role is distinct from 'admin';

alter table public.profiles enable trigger profiles_protect_role;
