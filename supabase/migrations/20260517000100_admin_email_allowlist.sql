-- Promote known owner emails no matter which auth provider creates
-- the auth.users row. This makes Email, Google, and GitHub sign-ins
-- converge on the same admin role as long as the verified email is
-- one of the owner addresses below.

create or replace function public.is_owner_email(check_email text)
returns boolean
language sql
immutable
as $$
  select lower(coalesce(check_email, '')) in (
    'markyu0615@gmail.com',
    'zyu347@uwo.ca'
  );
$$;

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

  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    nullif(meta_display_name, ''),
    nullif(meta_avatar_url, ''),
    case when public.is_owner_email(new.email) then 'admin' else 'user' end
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
  and p.role is distinct from 'admin';

alter table public.profiles enable trigger profiles_protect_role;
