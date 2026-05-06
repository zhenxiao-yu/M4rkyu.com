# Agent Guidance

This repository has two portfolio apps. Read this before changing files.

## Default Work Target

- Default future development should happen in `next-portfolio/`.
- The repository root is the legacy production Vite + React app.
- Touch the root Vite app only for narrow legacy production fixes.
- Do not delete the legacy app.
- Do not repoint production unless the user explicitly asks for a cutover task.

## Stack Boundaries

- Root app conventions: Vite, React 18, JavaScript/JSX, React Router, custom CSS,
  styled-components, and legacy animation libraries.
- Next remake conventions: Next.js App Router, TypeScript, `next-intl`,
  Tailwind CSS 4, owned shadcn/Radix-style primitives, Zod content schemas,
  Storybook, and Playwright.
- Do not apply root Vite conventions to the Next app.
- Do not apply Next.js or TypeScript conventions to the legacy root app.
- Keep package versions, build config, and runtime code unchanged unless the task
  explicitly calls for those changes.

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
