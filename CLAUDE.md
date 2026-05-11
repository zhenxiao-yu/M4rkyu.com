# Agent Guidance

The Next.js portfolio for m4rkyu.com. Single-app repo at the root.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

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
