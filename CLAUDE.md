# Agent Guidance

This repository has two portfolio apps. Read this before changing files.

## Default Work Target

- Default future development should happen in `next-portfolio/`.
- The repository root is the legacy production Vite + React app.
- Touch the root Vite app only for narrow legacy production fixes.
- Do not delete the legacy app.
- Do not repoint production unless the user explicitly asks for a cutover task.

## Stack Boundaries

- Root app conventions: Vite, React 18, JavaScript/JSX, React Router v5,
  custom CSS, styled-components, Firebase 10, and legacy animation libraries.
- Next remake conventions: Next.js App Router, TypeScript, `next-intl`,
  Tailwind CSS 4, owned shadcn/Radix-style primitives, Zod content schemas,
  Storybook, and Playwright.
- Do not apply root Vite conventions to the Next app.
- Do not apply Next.js or TypeScript conventions to the legacy root app.
- Keep package versions, build config, and runtime code unchanged unless the task
  explicitly calls for those changes.

## Legacy Root Notes

- The root app is JSX/JavaScript only. Do not create `.tsx` or `.ts` files for
  legacy production fixes.
- React Router is v5. Use `<Switch>`, `<Route>`, `useHistory`, `useLocation`,
  and `NavLink`; do not convert the root app to React Router v6 conventions.
- Root content lives primarily in `src/assets/data/`.
- Firebase config is read from `VITE_FIREBASE_*` environment variables.
- `dist/` is generated output. Do not edit it directly.

## Content Safety

- Keep private phone number and home address information out of source,
  fixtures, public content, placeholder text, screenshots, and generated assets.
- If contact information is needed, prefer approved public channels already used
  by the project.

## Commands

Run root legacy commands from the repository root:

```bash
npm install
npm start
npm run build
npm run preview
```

Run Next remake commands from `next-portfolio/`:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

No build is required for documentation-only changes unless markdown tooling is
available and relevant.
