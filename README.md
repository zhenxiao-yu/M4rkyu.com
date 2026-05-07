# M4rkyu.com

Personal portfolio monorepo for Zhenxiao (Mark) Yu.

This repository currently contains two portfolio applications with different responsibilities:

- **Repository root:** the legacy Vite + React portfolio that still represents the current production-safe baseline.
- **`next-portfolio/`:** the actively developed Next.js remake and the preferred target for new portfolio features, content polish, and migration work.

Treat this README as the maintainer map for safe development and cutover planning.

## Current Status

- Production site status: legacy root app remains the safe deployment baseline.
- Active development target: `next-portfolio/`.
- Cutover rule: do not repoint production to the Next.js remake until the launch gates in `MIGRATION.md` are complete and explicitly approved.

## Where To Work

- For new portfolio features, design improvements, and modern frontend work, edit **`next-portfolio/`**.
- For urgent fixes that must land before cutover, edit the **root legacy Vite app** as narrowly as possible.
- Do not mix legacy maintenance changes and Next migration work in the same PR unless the task genuinely requires both.
- Keep personal phone numbers, home addresses, and other private data out of source, fixtures, screenshots, and generated content.

## Repository Layout

### Root legacy Vite app

The repository root contains the original Vite + React portfolio. It remains preserved for production safety while the remake continues in `next-portfolio/`.

Run these from the repository root:

```bash
npm install
npm start
npm run build
npm run preview
```

Environment variables for the legacy app live in `.env` based on `.env.example`.

### Next.js remake

`next-portfolio/` is the preferred target for ongoing work. It uses Next.js App Router, TypeScript, `next-intl`, Tailwind CSS 4, component primitives, structured content schemas, Storybook, and Playwright.

Run these from `next-portfolio/`:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

If the Windows workspace hits `.next` file locking issues, follow the isolated output guidance documented in `next-portfolio/README.md`.

## AI Collaboration

This repo is optimized for multi-agent development. See [AGENTS.md](AGENTS.md) for planning, implementation, review, validation, and migration-safety rules.

The short version:

- choose the correct app before editing anything
- keep changes scoped to one app whenever possible
- document migration-impacting decisions in `MIGRATION.md`
- do not treat routine feature work as authorization to cut over production

## Deployment And Cutover Safety

- Production currently remains on the legacy root app.
- `next-portfolio/` should ship to preview deployments first.
- Do not point `m4rkyu.com` or `www.m4rkyu.com` to the Next.js remake until launch gates are complete and the switch is intentionally approved.
- Keep rollback paths clear until after a successful cutover.

## Related Docs

- `MIGRATION.md` for migration status, launch gates, and verification notes
- `AGENTS.md` for repo-level multi-agent workflow rules
- `next-portfolio/README.md` for the modern app's local development details

## License

MIT — see [LICENSE](LICENSE).
