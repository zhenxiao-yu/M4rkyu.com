# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The Next.js portfolio for m4rkyu.com. Single-app repo at the root. Node `22.x`.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

Next.js 16 + React 19 + Tailwind 4. APIs, conventions, and file structure
differ from older training data — read the relevant guide in
`node_modules/next/dist/docs/` before writing route handlers, metadata, or
runtime config. Heed deprecation notices. The `edge` runtime has been dropped
from all OG image routes (see recent commit `4ff0a5e`); do not re-introduce
it.
<!-- END:nextjs-agent-rules -->

## Commands

```bash
npm run dev                 # next dev
npm run build               # next build (production)
npm run start               # next start
npm run lint                # eslint src .storybook tests next.config.ts playwright.config.ts
npm run typecheck           # tsc --noEmit --incremental false
npm run validate            # lint + typecheck (the pre-PR gate)
npm run format              # prettier --check
npm run format:write        # prettier --write
npm run analyze             # ANALYZE=true next build (bundle analyzer)
npm run storybook           # storybook dev -p 6006
npm run build-storybook     # storybook build
npm run test:e2e            # playwright test (route smoke matrix)
```

Run a single Playwright test:

```bash
npx playwright test tests/smoke.spec.ts -g "<test name substring>"
npx playwright test --project=chromium-1280   # one viewport project
```

`test:e2e` boots its own Next dev server with `NEXT_DIST_DIR=.next-playwright`
and sweeps 360 / 390 / 768 / 1280 / 1920 widths.

**Windows `.next` lock workaround:** if dev or build trips a filesystem lock,
set an isolated output dir before running:

```powershell
$env:NEXT_DIST_DIR = ".next-dev-3000"
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Architecture

**Routing.** All user-facing routes live under `src/app/[locale]/…`. The
`[locale]` segment is driven by `next-intl` (`src/i18n/routing.ts`, locales
`en` + `zh`, `localePrefix: "always"`, default `en`). Top-level
`src/app/{layout,page,sitemap,robots,icon}.tsx` plus the locale-less
`opengraph-image.tsx` are infrastructure — the *site* is everything under
`[locale]`. The `[locale]` layer hosts route segments for `about`, `work`,
`games`, `media`, `archive`, `resources`, `logs`, `contact`, `portal`, each
with co-located `opengraph-image.tsx` route handlers.

**i18n contract.** Every visible string routes through `next-intl` and must
exist in *both* `messages/en.json` and `messages/zh.json`. CJK is
hand-translated, never transliterated. `next-intl`'s `Link` resolves locale
from context — do not pass a `locale` prop.

**Content layer.** Portfolio data is data-driven, not hardcoded into pages.
Sources of truth live in `src/content/{profile,projects,games,gallery,media,
resources,services}.ts` and are validated by Zod in
`src/content/schemas.ts`. Add or edit content there; the sitemap
(`src/app/sitemap.ts`) only emits entries marked `ready`, so drafts stay out
of search.

**SEO.** Single canonical host comes from `src/lib/seo/site.ts` and feeds
`metadataBase`, sitemap, and robots. Per-route `generateMetadata` builds
canonical + hreflang via `src/lib/seo/alternates.ts`. OG cards are rendered
by `src/lib/seo/og-image.tsx` plus the `opengraph-image.tsx` handlers under
`[locale]`, `[locale]/work/[slug]` (a.k.a. projects), and
`[locale]/games/[slug]`. Do not set `runtime = "edge"` on these.

**UI primitives.** Owned shadcn/Radix-style components live in
`src/components/ui`. They are the only UI system — do not add another
library. `Button` variants are `default | secondary | outline | ghost |
link` (no `destructive`). Compose new components from these primitives.

**Styling.** Tailwind CSS 4 with semantic tokens defined in
`src/app/globals.css` (`--ring`, `--motion-fast`, `--ease-premium`,
`--game-accent`, `--font-pixel`, the `--pixel-*` / `--hud-*` /
`--mission-*` family). Always use tokens — no `bg-zinc-*`, no hex
literals, no invalid v4 syntax like `transition-[colors,transform]`. Single
accent only: `--ring` (aliased `--game-accent` for playful surfaces).
Pixel typography (`--font-pixel`, VT323) is opt-in and English-only; the
`:lang(zh)` / `[lang^="zh"]` guard in `globals.css` swaps it back to the
sans stack for CJK.

**Motion.** `motion/react` (Framer Motion successor) plus GSAP via
`@gsap/react` for choreographed sequences (`src/lib/gsap.ts`). Every
animated primitive must honor `useReducedMotion()`; pointer-tracking effects
short-circuit on touch via `matchMedia("(pointer: fine)")`. Easings inside
`motion/react` are hardcoded because `transition.ease` can't read CSS vars —
leave the inline carve-out comment when you do this.

**Server boundaries.** Server-only utilities live in `src/lib/server/`,
forms/email in `src/lib/email/` + `src/lib/forms/`, social/share in
`src/lib/social/`, audio in `src/lib/audio/`. Env access goes through
`src/lib/env.ts` (`@t3-oss/env-nextjs`). Middleware (`src/middleware.ts`)
handles the next-intl locale negotiation.

**Verification & doctrine docs.** The repo's design + workflow doctrine
lives under `docs/` — `AI_WORKFLOW.md` (PR cadence, validation gate),
`COPY_VOICE.md` (tone test, §6 is the bar for autonomous copy), the
`REDESIGN_DIRECTION.md` / `UNIFIED_VISUAL_DIRECTION.md` pair (visual
budget), and `architecture/`. When polishing on your own initiative, anchor
choices to these.

## Stack Rules

- Next.js App Router patterns under `src/app`.
- TypeScript for source files.
- Localized routes under the `next-intl` structure, currently `/en` and `/zh`.
- Tailwind CSS 4 conventions already present in `src/app/globals.css` and
  component classes.
- Owned shadcn/Radix-style primitives from `src/components/ui` — do not
  introduce a separate UI system.
- Structured portfolio content stays data-driven under `src/content`, validated
  by the Zod schemas in `src/content/schemas.ts`.

## Content Rules

- Prefer editing data in `src/content` over hardcoding page copy directly in
  routes or components.
- Keep placeholder content out of production routes unless it is intentionally
  marked draft, pending, coming soon, or otherwise explicit.
- Do not add fake metrics, fake clients, fake awards, private phone numbers, or
  home address details. Use approved public contact channels only.

## Verification

- Use Storybook for component states and visual primitives.
- Use Playwright for route-level smoke and interaction checks.
- For meaningful UI, content, or routing changes, prefer:

```bash
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

If the H: workspace hits Windows `.next` filesystem locks, set `NEXT_DIST_DIR`
to an ignored output directory for local dev or verification, as described in
[README.md](README.md).

## Initiative & Autonomy

Default posture: **act, then summarize.** Do not ask for permission on
green-zone work; do not over-narrate yellow-zone work. Bundle related polish
into one coherent pass instead of shredding into micro-edits — a "fix the
header" task may reasonably touch nav copy, focus styles, and a missing
translation key in the same change. The user prefers one well-shaped commit
over five timid ones.

When polishing on your own initiative, anchor every choice to the existing
doctrine docs (`docs/COPY_VOICE.md`, `docs/REDESIGN_DIRECTION.md`, anything
under `docs/architecture/`). The doctrine is the budget — work within it
freely.

**Green zone — proceed without asking:**

- Copy nudges that pass the `docs/COPY_VOICE.md` §6 tone test.
- A11y fixes: `aria-hidden` on decorative icons, alt text, focus-visible,
  label associations, contrast.
- Missing empty / loading / error states for components that already have a
  primary state.
- Translation-key parity between `messages/en.json` and `messages/zh.json`.
- Dead code, unused imports, stale TODOs, unreferenced exports.
- Tailwind / CSS cleanup that preserves visual intent (e.g. consolidating
  duplicate classes, fixing invalid v4 syntax like `transition-[colors,transform]`).
- Storybook stories for primitives that lack them.
- Schema-safe content edits in `src/content` (using the green-zone allowed by
  the existing Zod schemas, no new fake metrics/clients).

**Yellow zone — do it, then flag in the end-of-turn summary:**

- New components that compose existing `src/components/ui` primitives.
- New routes that fit the existing `[locale]` App Router structure.
- Refactors crossing multiple files within one concern.
- Adding a new key to `messages/*.json` (always add to both locales).
- Visible copy changes on production routes (must still pass tone test).

**Red zone — stop and ask:**

- Package version bumps, lockfile churn, `next.config.ts` edits (the webpack
  overrides there are load-bearing — see memory).
- Dropping/renaming locales, breaking the `next-intl` URL contract.
- Architectural moves: folder restructure, library swaps, content schema
  breaking changes.
- Real personal data: home address, private phone, fake metrics, fake
  clients, fake awards.
- Destructive git: force-push to `main`, branch reset, deleting unmerged
  branches.

If a task is genuinely ambiguous, prefer one short clarifying question over a
plan-mode preamble. If the answer is "use taste," that means proceed.

## Boundaries

- The legacy Vite app has moved to
  [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive).
  Do not import or reference legacy code from this repo.
- The red-zone list above replaces the older blanket "do not change anything
  unless explicitly required." Polish freely inside the green zone; the
  red-zone items are the only hard stops.
