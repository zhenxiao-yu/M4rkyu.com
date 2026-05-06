# Next Portfolio Agent Guidance

`next-portfolio/` is the active Next.js remake and the preferred target for new
portfolio work.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

## Stack Rules

- Use Next.js App Router patterns under `src/app`.
- Use TypeScript for source files.
- Keep localized routes under the `next-intl` locale structure, currently
  including `/en` and `/zh`.
- Use Tailwind CSS 4 styling conventions already present in `src/app/globals.css`
  and component classes.
- Use owned shadcn/Radix-style primitives from `src/components/ui` rather than
  introducing a separate UI system.
- Keep structured portfolio content data-driven in `src/content`.
- Validate content shape with the existing Zod schemas in `src/content/schemas.ts`.

## Content Rules

- Prefer editing data in `src/content` over hardcoding page copy directly in
  routes or components.
- Keep placeholder content out of production routes unless it is intentionally
  marked draft, pending, coming soon, or otherwise explicit.
- Do not add fake metrics, fake clients, fake awards, private phone numbers, or
  home address details.
- Use approved public contact channels only.

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
`README.md` and `../MIGRATION.md`.

## Boundaries

- Do not borrow legacy root Vite patterns for this app.
- Do not change root production deployment behavior from this directory.
- Do not modify package versions, build config, or runtime code unless the task
  explicitly requires it.
