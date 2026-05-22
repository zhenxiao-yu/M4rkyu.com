---
title: M4rkyu.com — Backend Architecture (Supabase)
status: historical audit — partially superseded by implemented Supabase auth/CMS
audience: implementation agents (Claude, Codex), reviewers
last_updated: 2026-05-16
---

# Backend Architecture — Historical Phase 1 Audit

> **Status: historical.** Supabase auth, RLS migrations, admin surfaces,
> comments, saves, shop, and CMS tables now exist in the app. Treat this file
> as background context, not current implementation doctrine. Current request
> interception is `src/proxy.ts` (Next 16 proxy), not legacy `middleware.ts`.
> Current routes are the folders under `src/app/[locale]/`.

---

## 0. Doctrine conflict (must read first)

The author's current request is to wire Supabase + Google/GitHub OAuth +
user profiles + auth-gated saves + auth-gated comments.

That direction **contradicts** the existing living spec at
[GALLERY_SOCIAL_SPEC.md](./GALLERY_SOCIAL_SPEC.md):

| Spec rule (today)                                                                                                                        | New request                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| §5 _Likes UI_: "Anonymous-only (no login). Visitor identity = a stable cookie ID."                                                       | OAuth login, user profiles                        |
| §6 _Comments UI_: "Anonymous post with a display-name field (free-form, validated)" · "Forbidden: Login walls."                          | Comments require sign-in                          |
| §7 _Save / Favorite_: localStorage + (Phase 2) "Optional sync to backend keyed on visitor **cookie ID**."                                | Saves require sign-in                             |
| §14 _Backend Options_: "**Recommendation:** Upstash Redis (or Vercel KV) for Phase 1 likes; add Supabase in Phase 2 when comments land." | Supabase from day one                             |
| §17 _Admin Controls_: "Gated by env-secret bearer token (no public login)."                                                              | Admin route gated by `role='admin'` in `profiles` |
| §22 _Future Phase_: "Visitor recovery code for cross-device save sync" (still anonymous)                                                 | Identity is now the user account, not a cookie    |

The new direction is coherent and reasonable — every modern personal
site that wants comments + moderation lands on auth eventually — but it
**retires the anonymous-cookie identity model**. We cannot ship both
identity models cleanly side-by-side; one must win.

This document assumes **the new request supersedes the spec**. Before
any code lands, the author must either (a) confirm that assumption and
update `GALLERY_SOCIAL_SPEC.md` to match, or (b) redirect to a hybrid
(e.g. likes stay anonymous, saves/comments require login). See §13.

---

## 1. Repo state today (audit findings)

### 1.1 Route map (everything under `src/app/[locale]/`)

| Route                            | Renderer      | Data source                                                                  |
| -------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `/[locale]` (home)               | SSR           | `src/content/projects.ts` + home sections                                    |
| `/[locale]/about`                | SSR           | `src/content/profile.ts`                                                     |
| `/[locale]/work`                 | SSR + island  | `src/content/projects.ts`                                                    |
| `/[locale]/work/[slug]`          | SSR           | `src/content/projects.ts` (+ `src/lib/content/localize.ts`)                  |
| `/[locale]/games`                | SSR + island  | `src/content/games.ts`                                                       |
| `/[locale]/games/[slug]`         | SSR           | `src/content/games.ts`                                                       |
| `/[locale]/archive`              | SSR + island  | `src/content/gallery.ts`                                                     |
| `/[locale]/archive/[collection]` | SSR           | `src/content/gallery.ts`                                                     |
| `/[locale]/archive/saved`        | SSR + island  | `src/content/gallery.ts` + `localStorage` (`m4_saved_frames`)                |
| `/[locale]/logs`                 | SSR (ISR 24h) | `src/lib/blog/get-posts.ts` → dev.to API (`username=markyu`)                 |
| `/[locale]/logs/[slug]`          | SSR (ISR 24h) | `src/lib/blog/get-post.ts` → dev.to API                                      |
| `/[locale]/media`                | SSR           | `src/content/media.ts`                                                       |
| `/[locale]/resources`            | SSR + island  | `src/content/resources.ts`                                                   |
| `/[locale]/contact`              | SSR + form    | `src/content/services.ts` + server action `_actions.ts` (Resend + Turnstile) |
| `/[locale]/notes`                | SSR (empty)   | none yet — `EmptyArchiveState` only                                          |
| `/[locale]/shop`                 | SSR (stub)    | none yet                                                                     |

`localePrefix: "always"` (locales: `en`, `zh`). Request interception is already
implemented in `src/proxy.ts`, where Next 16 proxy composes next-intl locale
negotiation with Supabase session refresh. Do not add a legacy
`middleware.ts` alongside it.

### 1.2 Content sources

- Static: every type in `src/content/{profile,projects,games,gallery,resources,media,services,blog-page,music}.ts`.
- Stable identifier: every content type has a `slug: z.string().min(1)`
  field. Saves / comments / saved-items can safely key on
  `(item_type, slug)`.
- Status field: every type has `contentStatus` or `status` ∈
  `{"ready" | "draft" | "placeholder" | "coming-soon" | …}`. Drafts are
  excluded from the sitemap already.
- Dev.to: `src/lib/blog/devto.ts` + `get-post(s).ts` syndicate the
  author's dev.to feed via ISR 24h. **Logs canonical URL points to
  dev.to, not m4rkyu.com.** Comments on logs face a design choice — see
  §6.5.

### 1.3 Placeholder usage (homepage + visible surfaces)

- `src/app/[locale]/about/page.tsx` — `PlaceholderImage` for missing
  portrait.
- `src/app/[locale]/archive/saved/_client.tsx` — `PlaceholderImage` for
  frames without `src`.
- `src/app/[locale]/contact/page.tsx` — `ContentPendingLabel` on the
  form provider note.
- Homepage (`src/app/[locale]/page.tsx` + `src/components/sections/*`)
  — no obvious placeholder cards or fake metrics. The sections render
  real `ready` content from `src/content/*`, and drafts collapse rather
  than show "TBD" tiles. **Phase 10 of the new request is therefore
  largely a no-op for the homepage** — the placeholder problem the
  prompt anticipates is not present in this repo. (Author-facing
  callout: confirm.)

### 1.4 Existing social plumbing (the load-bearing finding)

The repo already has a complete client-side likes + saves abstraction
designed for swap-in:

- `src/lib/social/likes.ts` — `isLiked`, `toggleLike`, `getLikedSlugs`,
  `subscribe`. Backed by `localStorage` key `m4_liked_frames`.
- `src/lib/social/saves.ts` — `isSaved`, `toggleSave`, `getSavedSlugs`,
  `subscribe`. Backed by `localStorage` key `m4_saved_frames`,
  cap 200, FIFO eviction.
- `src/lib/social/hooks.ts` — `useIsLiked`, `useIsSaved`,
  `useSavedSlugs` via `useSyncExternalStore`.
- `src/components/gallery/gallery-actions.tsx` — the only consumer
  (today).

The header comment of each module says:

> "A future backend sync will replace the body of these functions; UI
> code never imports localStorage directly."

This is **the migration seam**. We swap the bodies; UI doesn't change.
For Supabase, the swap also means making them `async` and forking the
client/server reads — which is the only invasive part of the migration.

### 1.5 Existing server-side patterns

- `src/app/api/health/route.ts` — uptime probe.
- `src/app/api/webhooks/resend/route.ts` — Resend webhook, HMAC-verified,
  logs only (no DB).
- `src/app/[locale]/contact/_actions.ts` — `"use server"` action with
  Turnstile gate + honeypot + Resend send. **This is the existing
  template for any new server actions we add.**
- `src/lib/env.ts` — `@t3-oss/env-nextjs` typed env; missing required
  keys fail the build at module load. Lint/typecheck contexts skip
  validation.
- No session, no cookies-as-auth, no DB, no Redis, no KV.

### 1.6 Translation files

`messages/en.json` and `messages/zh.json` are sibling files, ~552 lines
each, with 29 top-level namespaces. Translation-key parity is a
project rule (`docs/AI_WORKFLOW.md`, repo CLAUDE.md green zone). Every
new auth UI string we add lands in both files in the same change.

---

## 2. Proposed ownership boundary

### 2.1 Stays static / content-file based (no migration)

- All polished case studies (`src/content/projects.ts`).
- All games (`src/content/games.ts`).
- The about page (`src/content/profile.ts`).
- Gallery items and collections (`src/content/gallery.ts`) — the
  catalog stays in code; only **user actions on items** go to Supabase.
- Resources, services, media — same rule.
- Logs (dev.to ISR) — dev.to remains canonical.
- All copy + translations (`messages/*.json`).
- Homepage section composition — code, not CMS.

### 2.2 Moves to Supabase (new)

- `profiles` (1:1 with `auth.users`).
- `user_preferences`.
- `user_saved_items` — replaces `localStorage` saves.
- `comments` + moderation state.
- `admin_settings` (key/value for any small dynamic toggles the author
  wants — e.g. featured frame override, banner copy override).
- Optional `audit_log` (admin actions only).

### 2.3 Open question: likes

The new request omits likes. Three coherent options:

1. **Drop the likes feature.** Cleanest. Saves + comments are the
   social layer.
2. **Keep likes anonymous** (cookie-keyed) — needs Upstash KV or a
   Supabase table with no `user_id`. Preserves the original §5
   doctrine.
3. **Auth-gate likes.** Consistent with saves/comments, but pulls every
   "♡" affordance behind a login wall — likely too high-friction.

Recommend **option 1** (drop likes) for the MVP. Saves cover the same
intent for signed-in users. If the author disagrees, we'll spec it.

---

## 3. Proposed auth flow

- **Provider**: Supabase Auth via `@supabase/ssr` (the current
  recommended package for Next.js App Router, replacing
  `@supabase/auth-helpers-nextjs`).
- **Methods**: Google OAuth, GitHub OAuth, email magic link. No
  password auth (avoids reset flows + breach concerns).
- **Session storage**: HTTP-only cookies set/refreshed by Supabase SSR
  middleware.
- **Callback**: `src/app/auth/callback/route.ts` (locale-less so OAuth
  redirect URIs in Google/GitHub consoles don't depend on locale).
- **Guest browsing**: All public routes remain reachable as a guest.
  Sign-in is required only at the action layer (save click, comment
  submit) and at protected routes (`/account`, `/admin`).
- **Sign-in prompt**: a `Sheet` / `Dialog` triggered inline when a
  guest taps a save or comment-submit. Friendly, ≤1 sentence, with
  "continue as guest" returning to the previous state.

---

## 4. Proposed library layout

```
src/lib/supabase/
  client.ts             # browser singleton (anon key)
  server.ts             # server singleton (per-request, uses cookies())
  middleware.ts         # session refresh helper (called from middleware.ts)
  types.ts              # Database types generated from supabase gen types
  queries/
    profile.ts
    saved-items.ts
    comments.ts
    admin.ts
  mutations/
    profile.ts
    saved-items.ts
    comments.ts
    admin.ts

src/lib/auth/
  get-current-user.ts   # returns { user, profile } | null
  require-user.ts       # throws/redirects if guest — for server actions
  require-admin.ts      # throws/redirects if not admin
  oauth-buttons.tsx     # "Sign in with Google/GitHub" client cluster

src/lib/social/
  saves.ts              # MIGRATED — async, hits Supabase via server action
  likes.ts              # see §2.3
  hooks.ts              # MIGRATED — uses server data + optimistic UI

src/lib/comments/
  comments.ts           # query + post + edit + delete
  moderation.ts         # admin-only state transitions

src/lib/admin/
  permissions.ts        # isAdmin(userId)
  admin-settings.ts     # key/value getter + setter
```

Migrations:

```
supabase/
  migrations/
    20260516_000_extensions.sql           # uuid-ossp / pgcrypto if needed
    20260516_001_profiles.sql
    20260516_002_user_preferences.sql
    20260516_003_user_saved_items.sql
    20260516_004_comments.sql
    20260516_005_admin_settings.sql
    20260516_006_audit_log.sql            # optional
    20260516_010_rls.sql                  # one consolidated RLS file
    20260516_020_functions.sql            # handle_new_user, is_admin, updated_at
  seed.sql                                # initial admin settings rows only
  config.toml                             # if we wire `supabase` CLI locally
```

---

## 5. Proposed schema (MVP only)

Mirrors the prompt's spec; tightened where prudent.

### 5.1 `profiles`

- `id uuid primary key references auth.users(id) on delete cascade`
- `username citext unique` (case-insensitive); allowed regex
  `^[a-z0-9_-]{3,24}$`
- `display_name text` (≤ 60 chars)
- `avatar_url text`
- `website text` (URL-validated server-side)
- `bio text` (≤ 280 chars)
- `role text not null default 'user' check (role in ('user','admin'))`
- `public_profile boolean not null default true`
- `created_at`, `updated_at` (trigger).

`handle_new_user()` trigger on `auth.users` insert creates a stub
profile populated from OAuth metadata (`name`, `avatar_url`).

### 5.2 `user_preferences`

- `user_id uuid primary key references profiles(id) on delete cascade`
- `email_notifications boolean not null default false`
- `theme_preference text check (theme_preference in ('light','dark','system'))`
- `locale_preference text check (locale_preference in ('en','zh'))` —
  optional override over next-intl negotiation
- `created_at`, `updated_at`.

### 5.3 `user_saved_items`

- `user_id uuid references profiles(id) on delete cascade`
- `item_type text not null check (item_type in
('project','gallery','log','game','resource','note'))`
- `item_key text not null`
- `saved_at timestamptz default now()`
- `primary key (user_id, item_type, item_key)`

### 5.4 `comments`

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid references profiles(id) on delete set null`
- `parent_id uuid references comments(id) on delete cascade` (flat in
  MVP — we set `parent_id` but UI doesn't render nested threads yet)
- `item_type text not null check (item_type in
('project','gallery','log','game','note'))`
- `item_key text not null`
- `body text not null check (char_length(body) between 1 and 2000)`
- `status text not null default 'pending' check (status in
('pending','approved','rejected','hidden'))`
- `is_edited boolean not null default false`
- `created_at`, `updated_at`.
- Indexes: `(item_type, item_key, status, created_at desc)`,
  `(user_id, created_at desc)`, `(status) where status='pending'`.

Admin comments auto-approve via insert trigger
(`if is_admin(new.user_id) then new.status := 'approved'`).

### 5.5 `admin_settings`

- `key text primary key`
- `value jsonb not null default '{}'::jsonb`
- `updated_at`.

Seed rows: `featured_frame_slug`, `home_banner_copy_override`,
`comments_enabled`.

### 5.6 Skipped for MVP

- `comment_reactions` — defer, not load-bearing.
- `notes` — `/notes` route is empty today; building a dynamic note
  system before the page even has copy is premature.
- `audit_log` — add only when an admin action proves it's needed.

---

## 6. Proposed surfaces

### 6.1 Account

`/[locale]/account` (auth required, server redirect to sign-in if guest):

- avatar, display name, username (read-only after first set), member
  since
- tabs (Radix `Tabs`): **Saved · Comments · Settings**
- sign-out button

`/[locale]/account/saved` — server-rendered list of `user_saved_items`
joined against the static content in `src/content/*`. Items whose
content is gone or `coming-soon` render a tombstone tile.

`/[locale]/account/comments` — author's own comments grouped by source
item; show status badge (pending / approved / etc.); edit + delete own.

`/[locale]/account/settings` — preferences (notifications, locale,
theme) + profile fields (display name, bio, website, avatar URL,
public_profile toggle). `username` editable once; role is hidden.

### 6.2 SaveButton (client primitive)

- Props: `itemType`, `itemKey`, optional `variant`.
- Reads `useIsSaved(itemType, itemKey)` (server-data + optimistic UI).
- Click as guest → open sign-in `Sheet`.
- Click as user → call server action; optimistic flip; revert on error
  with `Sonner` toast.

Mount points: gallery lightbox (existing), gallery tiles (existing),
work detail header, log detail header (small affordance), game detail
header. Not on the homepage tiles (keeps the home quiet).

### 6.3 Comment thread (server component + client form island)

- Server-rendered list of approved comments for `(itemType, itemKey)`.
- Below it, a `CommentForm` island that mounts as:
  - guest → "Sign in to comment" CTA
  - signed-in user → textarea + submit
- After submit: optimistic insert with `status: 'pending'`, shown to
  the author with a "Awaiting review" badge.
- Body rendered as **plain text** (escape on output), no HTML/MDX. URL
  auto-linking is optional — recommend not, to dodge phishing surface.
- Edit / delete own comments allowed while `status in
('pending','rejected','hidden')`; `approved` comments are
  edit-locked (or marked `is_edited=true` if we allow editing).

Mounted on: work detail, log detail, gallery lightbox, game detail.
NOT on homepage, archive index, account pages, admin pages.

### 6.4 Admin

`/[locale]/admin` (auth + role='admin' required, otherwise 404):

- Overview: counts (users, comments by status, saves).
- `/admin/comments`: pending queue first; bulk approve/reject/hide.
- `/admin/users`: list profiles, promote/demote (with self-protection:
  the last remaining admin can't demote themselves).
- `/admin/settings`: `admin_settings` key/value editor.

All admin mutations live in server actions; the route is just the UI.
RLS is the actual guard.

### 6.5 Comments on dev.to-syndicated logs

The author should decide: do log posts get **their own m4rkyu.com
comments**, or do we link out to the dev.to comment thread (which the
syndicated `Post.commentsCount` already exposes)?

Two coherent answers:

- **A — own threads.** Comments live in Supabase keyed on
  `(item_type='log', item_key=slug)`. The dev.to count still renders
  as "Discuss on dev.to →".
- **B — link out.** No on-site comments for logs; the deep-link to
  dev.to is the comment surface. Saves still work on logs.

Recommend **A** (own threads) — keeps the comment system uniform.
Note in §13.

---

## 7. Security / RLS strategy

- RLS enabled on every table in the public schema. The default deny
  posture wins arguments.
- All mutations go through server actions or route handlers; the
  browser client only reads.
- Service-role key is NOT introduced in MVP. Every admin operation runs
  through RLS policies that check `is_admin(auth.uid())`. We add the
  service-role key only when a justified server-only batch job exists.
- Comment body is **stored verbatim** and **escaped on render**. No
  server-side sanitization of HTML — there's no HTML to sanitize
  because we never render the field as HTML.
- Rate limiting: in MVP, we rely on Supabase's per-IP request limits +
  a Postgres trigger that blocks > 5 comments / 60s per user. Upstash
  rate-limit lands later only if needed.
- CSRF: server actions already carry Next's per-request token via the
  action protocol — no extra work required.
- Turnstile: keep on the contact form; do **not** add it to
  signed-in mutations. Login itself is the rate gate.

Policies (high-level — full SQL lands in the migration):

| Table              | Read                                          | Insert            | Update                                             | Delete             |
| ------------------ | --------------------------------------------- | ----------------- | -------------------------------------------------- | ------------------ |
| `profiles`         | public (`public_profile=true` or own row)     | trigger only      | own row, except `role` (admin only)                | own row            |
| `user_preferences` | own row                                       | own row           | own row                                            | own row            |
| `user_saved_items` | own rows                                      | own rows          | own rows                                           | own rows           |
| `comments`         | approved comments; own + admin see all states | signed-in as self | own row when status≠'approved'; admin status field | own row; admin any |
| `admin_settings`   | admin                                         | admin             | admin                                              | admin              |

Service-role key, if eventually needed, is `SUPABASE_SERVICE_ROLE_KEY`
on `server` only, never in `runtimeEnv`'s `client` side, and never
imported into a `"use client"` file.

---

## 8. Env vars (additions to `src/lib/env.ts`)

```
client:
  NEXT_PUBLIC_SUPABASE_URL: z.string().url()
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1)
  NEXT_PUBLIC_SITE_URL: z.string().url()              # for OAuth redirect calc
server (optional, only if introduced later):
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional()
```

`@t3-oss/env-nextjs` already handles `runtimeEnv` mapping — we extend
the existing object, we don't introduce a parallel one.

---

## 9. Migration plan (no code lands until §13 is resolved)

1. **Doctrine update.** Edit `GALLERY_SOCIAL_SPEC.md` to mark §5/§6/§7
   superseded by `BACKEND_ARCHITECTURE.md`. (Yellow zone — but it's a
   doctrine document, so we flag the change in the PR description.)
2. **Schema + RLS.** Author runs migrations against a fresh Supabase
   project. Verify locally with `supabase start` if the author wants
   the CLI; otherwise apply via the dashboard SQL editor.
3. **Lib scaffolding.** Add `src/lib/supabase/{client,server,middleware}.ts`,
   `src/lib/auth/*`, `src/lib/comments/*`, `src/lib/admin/*`. No UI
   yet. Run lint + typecheck — green before moving on.
4. **Middleware.** Introduce `middleware.ts` that composes Supabase
   session refresh with next-intl middleware. This is the riskiest
   touch — it interacts with locale negotiation and the load-bearing
   `next.config.ts` webpack overrides (see repo CLAUDE.md). Validate
   with `npm run build` and `npm run test:e2e`.
5. **Auth UI.** Sign-in `Sheet`, callback route, sign-out action.
   Manual sanity check both providers.
6. **Account page.** Read-only first (avatar + display name + sign-out),
   then editable settings, then `/saved`, then `/comments`.
7. **Saves migration.** Swap `src/lib/social/saves.ts` body. Add a
   one-time client-side "we found N saved frames on this device —
   import to your account?" toast that calls a server action with the
   local-storage payload, then clears `m4_saved_frames`.
8. **Comment thread component.** Ship behind a route-level boolean
   flag from `admin_settings` (`comments_enabled`), default true. If
   abuse is bad we flip it off without a deploy.
9. **Admin pages.** Overview → comments queue → users → settings.
10. **Likes resolution.** Per author decision in §2.3.

Each numbered step is its own PR. The repo's `pr-prep` skill already
exists; we'll use it.

---

## 10. Performance posture

- Public pages stay server-rendered. The only added per-request cost is
  the middleware `getUser()` lookup, which is a single HTTP call to
  Supabase; the `@supabase/ssr` package caches it per-request.
- Comment threads server-render the approved list (no client fetch on
  first paint). The form is a client island; the list is not.
- Save buttons are leaf client components; they do not promote their
  parent page to client-rendering.
- Account + admin pages are explicitly dynamic — they read
  `cookies()`/`headers()`, so Next will mark them so.
- Sitemap stays gated by `status: 'ready'` — no new dynamic URLs are
  exposed to search.

---

## 11. Accessibility & i18n posture

- Every new key lands in both `messages/en.json` and `messages/zh.json`
  in the same PR. CJK is hand-translated.
- All form fields use `<Label htmlFor>` via `src/components/forms/`.
- Sign-in sheet is a Radix `Dialog` (focus trap + Escape + `aria-modal`
  by default).
- Save button uses `aria-pressed` + screen-reader-friendly label per
  state (matches the existing `GALLERY_SOCIAL_SPEC.md` §19 rules).
- Comment thread: `aria-live="polite"` region for new own-comment
  insertion. Empty state copy is meaningful, not "0 comments."
- Admin tables: real `<table>`, sortable headers, `caption` element.

---

## 12. Validation gate (after each Phase 9 step)

```
npm run lint
npm run typecheck
npm run build      # surfaces middleware + SSR regressions
npm run test:e2e   # route smoke matrix already exists
```

Storybook stories for new primitives (`SaveButton`,
`SignInSheet`, `CommentItem`, `CommentForm`) ship alongside the
component, not as a separate PR.

---

## 13. Decisions required before Phase 2 starts

Author input gates code changes. These are red-zone choices per the
repo CLAUDE.md:

1. **Confirm doctrine supersession.** Sign-off on retiring the
   anonymous-cookie model from `GALLERY_SOCIAL_SPEC.md` §5/§6/§7 in
   favor of account-bound saves + comments.
2. **Likes disposition.** Drop / keep anonymous / require login (§2.3
   — recommend drop).
3. **Comments on dev.to logs.** Own thread on m4rkyu.com vs link out
   to dev.to (§6.5 — recommend own thread).
4. **Magic-link login.** Include alongside Google + GitHub? (Adds
   `INQUIRY_FROM_EMAIL`-style sender concerns; Supabase handles it but
   the author chooses the sender domain.)
5. **Supabase project.** Author creates the project, provides
   `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. None
   of the code below works without those.
6. **OAuth app registration.** Author creates Google Cloud OAuth client
   and GitHub OAuth app; provides the redirect URI
   `https://m4rkyu.com/auth/callback` (and the local equivalent for
   dev). The agent cannot do this — it's a console action.
7. **First admin.** How is the first admin promoted? Two clean options:
   - Manual `update profiles set role='admin' where id='<your auth uid>'`
     in the Supabase SQL editor after first sign-in.
   - `ADMIN_BOOTSTRAP_EMAIL` env var → `handle_new_user` trigger sets
     `role='admin'` on match.
     Recommend the first (no env var coupling).

Once these are answered, Phase 2 (package install, lib scaffolding) can
begin. **Until then this document is the only artifact.**

---

## 14. Files likely to change in Phase 2+

Adds (no deletes yet):

```
middleware.ts                                     (root, new)
src/app/auth/callback/route.ts                    (new)
src/app/[locale]/account/page.tsx                 (new)
src/app/[locale]/account/saved/page.tsx           (new)
src/app/[locale]/account/comments/page.tsx       (new)
src/app/[locale]/account/settings/page.tsx       (new)
src/app/[locale]/admin/page.tsx                   (new)
src/app/[locale]/admin/comments/page.tsx          (new)
src/app/[locale]/admin/users/page.tsx             (new)
src/app/[locale]/admin/settings/page.tsx          (new)
src/components/auth/*                             (new — SignInSheet, OAuthButtons, UserMenu)
src/components/comments/*                         (new — CommentThread, CommentForm, CommentItem)
src/components/saves/save-button.tsx              (new)
src/lib/supabase/*                                (new)
src/lib/auth/*                                    (new)
src/lib/comments/*                                (new)
src/lib/admin/*                                   (new)
supabase/migrations/*                             (new)
supabase/seed.sql                                 (new)
.env.example                                      (new or updated)
```

Edits:

```
src/lib/env.ts                                    (add Supabase vars)
src/lib/social/saves.ts                           (swap body to server)
src/lib/social/hooks.ts                           (swap for server-data)
src/app/[locale]/archive/saved/_client.tsx        (account-aware empty + migration toast)
src/components/layout/page-shell.tsx (or nav)     (sign-in / account menu)
docs/GALLERY_SOCIAL_SPEC.md                       (supersede notice)
messages/en.json + messages/zh.json               (auth + account + comments keys)
README.md                                         (env + Supabase setup section)
```

---

End of audit. Nothing in this document has been implemented. Awaiting
author response to §13.
