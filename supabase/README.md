# Supabase setup

This directory holds the SQL that defines the user system: profiles,
preferences, saved items, comments, and admin settings. The Next.js
app reads from these tables through `src/lib/supabase/*` (anon key,
RLS-guarded).

See [docs/BACKEND_ARCHITECTURE.md](../docs/BACKEND_ARCHITECTURE.md) for
the architectural overview. This file is just the operational
runbook.

## Layout

```
supabase/
  migrations/
    20260516000100_extensions.sql
    20260516000200_profiles.sql
    20260516000300_user_preferences.sql
    20260516000400_user_saved_items.sql
    20260516000500_comments.sql
    20260516000600_admin_settings.sql
    20260516001000_functions_triggers.sql
    20260516002000_rls.sql
  seed.sql
```

Order matters — apply in filename order. The trigger file
(`_010_`) depends on every table existing; the RLS file (`_020_`)
depends on `public.is_admin()` from the trigger file.

## First-time setup

1. **Create the Supabase project.** https://supabase.com/dashboard →
   New project.
2. **Copy keys into `.env`** (use `.env.example` as the template):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Apply migrations.** Two options:
   - **Dashboard SQL editor** — paste each migration file in order,
     hit Run. Quick + visible.
   - **Supabase CLI** — `supabase link --project-ref <ref>` then
     `supabase db push`. Better for repeated environments.
4. **Apply seed.** `supabase/seed.sql` populates `admin_settings`
   with sensible defaults.
5. **Configure auth providers.** Dashboard → Authentication →
   Providers:
   - Enable **Email** with "Enable email signup" on. The UI supports
     password sign-in/sign-up plus email-code fallback. Use Supabase's
     confirmation URL in the email link: `{{ .ConfirmationURL }}`. If
     you hand-build the email link instead, include the token hash:
     `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`.
   - Enable **Google** — set Client ID / Secret from Google Cloud
     Console (OAuth 2.0 Client, Web application).
   - Enable **GitHub** — set Client ID / Secret from
     https://github.com/settings/developers → OAuth Apps.
   - Enable **Manual identity linking** in Authentication settings.
     The account settings screen uses Supabase `linkIdentity()` so a
     signed-in user can attach Google/GitHub to the same account. This
     is what prevents duplicate-account confusion when one OAuth
     provider exposes multiple verified emails.
6. **Configure redirect URLs.** Dashboard → Authentication →
   URL Configuration:
   - Site URL: production origin (e.g. `https://m4rkyu.com`).
   - Additional Redirect URLs (one per line):
     - `https://m4rkyu.com/auth/callback`
     - `http://localhost:3000/auth/callback`
     - any preview-deploy origin: `https://*-yourname.vercel.app/auth/callback`
7. **OAuth dashboard callback URLs.**
   - Google Cloud Console: add
     `https://<project-ref>.supabase.co/auth/v1/callback` to the
     OAuth client's "Authorized redirect URIs."
   - GitHub OAuth App: set Authorization callback URL to
     `https://<project-ref>.supabase.co/auth/v1/callback`.
     These are Supabase's project-level callbacks; Supabase then
     redirects back to your app's `/auth/callback`.

## First admin

Owner emails are allowlisted in
`20260517000100_admin_email_allowlist.sql` and hardened by
`20260517000200_admin_email_verified.sql` /
`20260518000200_oauth_owner_verified_metadata.sql`. Sign-ins for
`markyu0615@gmail.com` and `zyu347@uwo.ca` become admin only after the
email is verified by Supabase or by trusted OAuth provider metadata.

If you ever need to promote an extra account by hand, run this in the
Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@example.com'
);
```

We intentionally do **not** auto-promote by env var. Admin should be
a deliberate manual action, not a deploy-time accident.

To check who is admin:

```sql
select p.id, p.display_name, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';
```

## Resetting in development

Wipe and rerun (local Supabase only — never against production):

```sql
-- Drop triggers + functions first because they reference the tables.
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.comments cascade;
drop table if exists public.user_saved_items cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.admin_settings cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user();
drop function if exists public.is_admin(uuid);
drop function if exists public.touch_updated_at();
drop function if exists public.protect_profile_role();
drop function if exists public.auto_approve_admin_comments();
drop function if exists public.rate_limit_comments();
```

Then re-apply the migrations in order.

## What's NOT here

- No content tables for projects / gallery / games / posts. Those
  remain code-owned in `src/content/*` and from dev.to for logs.
  Supabase only stores **user actions on** that content, never the
  content itself.
- No `audit_log`. Add it only when an admin action proves it's
  needed.
- No `notes` table. The `/notes` route is empty today; building a
  dynamic note system before the page even has copy is premature.
- No service-role usage in code. Every admin operation runs through
  RLS as the signed-in admin user. `SUPABASE_SERVICE_ROLE_KEY` is
  wired in `src/lib/env.ts` as optional for future use only.
