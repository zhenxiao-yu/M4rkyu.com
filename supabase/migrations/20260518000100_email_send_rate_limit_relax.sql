-- Loosen the auth-email rate limits.
--
-- The 20260517000400 migration set them at 3/email/60s + 10/IP/600s
-- which is tight for active local testing (and not particularly
-- defensive in prod, given Supabase + Resend each apply their own
-- throttles upstream). New limits:
--   - 5 sends per email per 60-second window
--   - 30 sends per IP per 10-minute window
--
-- Same SQLSTATE pattern, same security-definer + grant — only the
-- two threshold constants change. `create or replace function` is
-- idempotent, so re-applying is safe.

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

  -- 5 sends per email per 60-second window (was 3).
  select count(*) into email_count
  from public.auth_email_sends
  where email_lower = normalised_email
    and sent_at > now() - interval '60 seconds';
  if email_count >= 5 then
    raise exception 'email rate limit exceeded'
      using errcode = 'P0001';
  end if;

  -- 30 sends per IP per 10-minute window (was 10).
  if p_ip is not null and p_ip <> '' then
    select count(*) into ip_count
    from public.auth_email_sends
    where ip = p_ip
      and sent_at > now() - interval '10 minutes';
    if ip_count >= 30 then
      raise exception 'ip rate limit exceeded'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.auth_email_sends (email_lower, ip)
  values (normalised_email, nullif(p_ip, ''));

  delete from public.auth_email_sends
  where sent_at < now() - interval '1 day';

  return true;
end;
$$;

revoke all on function public.record_email_send(text, text) from public;
grant execute on function public.record_email_send(text, text)
  to anon, authenticated;
