# AGENTS.md

## Project Intent
M4rkyu.com is a portfolio monorepo with a live legacy Vite site at the repository root and an actively developed Next.js remake in `next-portfolio/`. Priorities are safe migration, clean storytelling, and avoiding accidental production cutover.

## Preferred Agent Workflow
1. Planner: decide whether the task belongs to the legacy root app or `next-portfolio/` before editing.
2. Builder: keep changes scoped to one app at a time and avoid cross-app refactors in a single PR.
3. Reviewer: verify the correct app was changed and that migration/cutover safety rules still hold.

## Setup
### Legacy root app
```bash
npm install
npm start
```

### Next remake
```bash
cd next-portfolio
npm install
npm run dev
```

## Validation
### Legacy root app
```bash
npm run build
```

### Next remake
```bash
cd next-portfolio
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

## Guardrails
- Do not switch production from the legacy app to the Next remake without explicit approval.
- Do not mix root Vite fixes and Next migration work in the same PR unless the task requires both.
- Keep personal contact details and private data out of source, screenshots, fixtures, and generated content.
- Update `MIGRATION.md` and `README.md` when the repo map or launch gates change.

## Release Hygiene
- Treat migration milestones as release events with explicit notes.
- Recheck demo URLs, deployment targets, and cutover status before publishing changes.