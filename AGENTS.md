# AGENTS.md

## Project Intent

Next.js App Router portfolio for m4rkyu.com. The legacy Vite + React 18 site
has been archived to [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive).

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

## Setup

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

## Guardrails

- Keep personal phone numbers, home addresses, and other private data out of
  source, fixtures, screenshots, and generated content.
- Do not introduce legacy Vite patterns from the archive repo.
- Update [README.md](README.md) when the deploy or stack changes.
