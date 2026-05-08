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

## Boundaries

- The legacy Vite app has moved to
  [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive).
  Do not import or reference legacy code from this repo.
- Do not change package versions, build config, or runtime code unless the task
  explicitly requires it.
