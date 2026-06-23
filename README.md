# M4rkyu.com

Personal portfolio for Zhenxiao (Mark) Yu — live at
[m4rkyu.com](https://m4rkyu.com).

The legacy Vite + React 18 site that previously held this domain has been
archived to [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive)
and is reachable on a free `*.vercel.app` URL for rollback.

> **First time contributing (human or AI)?** Start with
> [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) — it documents the
> commit cadence (small commits on `main`; PR when large/risky),
> the validation gate, the code-review contract, and the
> non-negotiables for this codebase.

## Stack

- Next.js App Router with locale routes for `/en` and `/zh`.
- TypeScript end-to-end.
- `next-intl` for routing and message catalogs.
- Tailwind CSS 4 with owned shadcn/Radix-style UI primitives.
- Zod content schemas for structured portfolio data.
- Supabase (auth + Postgres + RLS) for the user system — accounts,
  saves, comments, admin moderation. See
  [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) and
  [supabase/README.md](supabase/README.md).
- Storybook for component states.
- Playwright for route smoke coverage.

## User system / backend

Public pages stay server-rendered from `src/content/*` (and from
dev.to via ISR for `/logs`). Supabase only owns **user actions on**
that content: profiles, saved/bookmarked items, comments + moderation,
and a small `admin_settings` key/value store.

To bring the user system online locally:

1. Copy `.env.example` to `.env` and fill in the Supabase block:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (optional; defaults to request origin)
2. Apply the SQL in `supabase/migrations/` in filename order (Dashboard
   SQL editor or `supabase db push`). Then run `supabase/seed.sql`.
3. Enable Google, GitHub, Discord, and Email (magic link) providers in the
   Supabase Auth → Providers dashboard. The redirect URLs you'll need
   are listed in [supabase/README.md](supabase/README.md).
4. Sign in once on your local dev server, then promote yourself to
   admin with the SQL in [supabase/README.md](supabase/README.md).

When the env vars are absent the auth UI hides itself and the rest of
the site continues to work — preview deploys without Supabase keys
won't 500.

## Local Development

Use Node.js 24.x with the npm 11.x version bundled with it. If you use `nvm`,
run `nvm use` from the repo root.

```bash
npm install
npm run dev
```

If a Windows `.next` filesystem lock blocks dev, run with an isolated output
directory:

```powershell
$env:NEXT_DIST_DIR = ".next-dev-3000"
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Verification

```bash
npm audit --audit-level=moderate
npm run validate            # lint + typecheck (aggregate)
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

`npm run test:e2e` starts a Next dev server with
`NEXT_DIST_DIR=.next-playwright` and checks the route matrix across 360, 390,
768, 1280, 1920, and desktop Chromium widths.

## CI

- **`.github/workflows/pr.yml`** runs `npm run validate` (lint + typecheck) and
  the Playwright smoke spec on every pull request. Merges are blocked on
  either failing.
- **`.github/workflows/release.yml`** runs the full validation suite on tag
  pushes (`v*.*.*`) and creates the GitHub release.
- Vercel handles the production build + per-PR preview deploys; Snyk + Socket
  gate dependency security.

## Deployment

`main` auto-deploys to the `m4rkyu-portfolio` Vercel project, which serves
`m4rkyu.com` and `www.m4rkyu.com` from the latest production build.

## SEO

- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt`. Only `ready` content lands in the sitemap; drafts are excluded.
- `src/lib/seo/site.ts` is the single source of truth for the canonical host
  used by `metadataBase`, sitemap, and robots.
- `src/lib/seo/alternates.ts` builds canonical + hreflang `languages` for every
  per-route `generateMetadata` call.
- `src/lib/seo/og-image.tsx` plus `opengraph-image.tsx` route handlers under
  `[locale]`, `[locale]/projects/[slug]`, and `[locale]/games/[slug]` produce
  per-route 1200×630 social cards via `next/og`.

## Working with AI agents

See [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) for the commit cadence,
code-review gate, validation contract, and the non-negotiables for this
codebase.

## Content Safety

Keep private phone numbers, home addresses, and other personal contact details
out of source, fixtures, screenshots, and generated assets. Use approved public
contact channels only.

## License

MIT — see [LICENSE](LICENSE).
