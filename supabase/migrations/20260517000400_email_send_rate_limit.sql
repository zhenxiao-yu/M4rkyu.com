-- Track magic-link / sign-in email sends and enforce a small rate
-- limit at the database level.
--
-- Why this exists: when the optional fast-path lands (admin
-- generateLink + Resend, see src/lib/auth/actions.ts), the service-
-- role key bypasses Supabase's built-in per-email throttle. Without
-- this guard a bot could request unlimited magic-link emails to
-- arbitrary addresses and burn through Resend's reputation budget.
--
-- The slow-path (signInWithOtp) already enforces its own limits via
-- Supabase's auth layer; we still call this guard there so the
-- behaviour is consistent across both code paths.

create table if not exists public.auth_email_sends (
  id uuid primary key default gen_random_uuid(),
  email_lower text not null,
  ip text,
  sent_at timestamptz not null default now()
);

create index if not exists auth_email_sends_email_idx
  on public.auth_email_sends (email_lower, sent_at desc);
create index if not exists auth_email_sends_ip_idx
  on public.auth_email_sends (ip, sent_at desc);

-- RLS denies all direct access. The RPC below is the only path in
-- and is locked down via security definer + an explicit grant.
alter table public.auth_email_sends enable row level security;

create or replace function public.record_email_send(
  p_email text,
  p_ip text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  email_count int;
  ip_count int;
  normalised_email text;
begin
  normalised_email := lower(coalesce(p_email, ''));
  if normalised_email = '' then
    raise exception 'email is required'
      using errcode = '22023';
  end if;

  -- 3 sends per email per 60-second window. Same intent as
  -- Supabase's built-in throttle but enforced regardless of which
  -- code path triggered the send.
  select count(*) into email_count
  from public.auth_email_sends
  where email_lower = normalised_email
    and sent_at > now() - interval '60 seconds';
  if email_count >= 3 then
    raise exception 'email rate limit exceeded'
      using errcode = 'P0001';
  end if;

  -- 10 sends per IP per 10-minute window. Defends against an
  -- attacker rotating email addresses from a single source.
  if p_ip is not null and p_ip <> '' then
    select count(*) into ip_count
    from public.auth_email_sends
    where ip = p_ip
      and sent_at > now() - interval '10 minutes';
    if ip_count >= 10 then
      raise exception 'ip rate limit exceeded'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.auth_email_sends (email_lower, ip)
  values (normalised_email, nullif(p_ip, ''));

  -- Garbage-collect rows older than a day. Cheap enough to run on
  -- every insert; the indexes keep it bounded.
  delete from public.auth_email_sends
  where sent_at < now() - interval '1 day';

  return true;
end;
$$;

revoke all on function public.record_email_send(text, text) from public;
grant execute on function public.record_email_send(text, text)
  to anon, authenticated;
