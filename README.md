# M4rkyu.com Portfolio

This repository currently contains two portfolio applications with different
roles. Treat this file as the source-of-truth map before making changes.

## Source Of Truth

- **Repository root:** legacy production Vite + React portfolio. This is the app
  currently serving the existing production site.
- **`next-portfolio/`:** active Next.js remake. This is the preferred target for
  new portfolio features, content improvements, design work, and migration tasks.

Do not delete the legacy root app. Do not repoint production as part of routine
development. The cutover should happen only after the launch gates in
`MIGRATION.md` are satisfied and explicitly approved.

## Which App Should I Edit?

- For future portfolio improvements, edit **`next-portfolio/`**.
- For legacy production fixes that must ship before cutover, edit the **root
  Vite app** only as narrowly as needed.
- Do not apply root Vite conventions to the Next remake.
- Do not apply Next.js or TypeScript migration conventions to the legacy root app.
- Keep private phone number and home address details out of source, fixtures,
  placeholder content, screenshots, and production copy.

## Root Legacy Vite App

The root app is a Vite + React portfolio styled with custom CSS and legacy
animation libraries. It remains preserved for production safety while the remake
continues in `next-portfolio/`.

### Root Commands

Run these from the repository root:

```bash
npm install
npm start
npm run build
npm run preview
```

- `npm start` launches the Vite development server, usually on
  `http://localhost:5173`.
- `npm run build` creates the legacy production build in `dist/`.
- `npm run preview` previews the legacy production build locally.

### Root Structure

- `src/index.jsx` mounts the legacy React tree.
- `src/Router.jsx` defines legacy routes.
- `src/pages/`, `src/components/`, and `src/assets/` contain legacy UI and
  content.
- `public/` contains static files served by the legacy site.
- `vercel.json` at the root belongs to the current production deployment setup.

## Next.js Remake

`next-portfolio/` is the active migration target for the new portfolio. It uses
Next.js App Router, TypeScript, `next-intl` locale routes, Tailwind CSS 4,
owned shadcn/Radix-style primitives, Zod-backed content schemas, Storybook, and
Playwright.

### Next Commands

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

- `npm run dev` launches the Next development server.
- `npm run lint` and `npm run typecheck` verify source quality.
- `npm run build` creates the Next production build.
- `npm run build-storybook` verifies component documentation.
- `npm run test:e2e` runs Playwright smoke coverage.

If the H: workspace hits Windows `.next` filesystem locks, use an isolated Next
output directory as documented in `next-portfolio/README.md`.

## Deployment And Cutover Safety

- Production currently remains on the legacy root Vite app.
- `next-portfolio/` should be deployed to preview first.
- Do not point `m4rkyu.com` or `www.m4rkyu.com` at the Next remake until launch
  gates are complete and the cutover is intentionally approved.
- Keep both apps available until after a successful cutover and rollback plan.

See `MIGRATION.md` for current migration status, verification notes, and launch
gates.
