# Contributing to M4rkyu.com

Thanks for contributing. This is a portfolio monorepo with two active contexts: the legacy root app and the `next-portfolio/` remake. The biggest rule is to make changes in the correct app and avoid accidental production cutover work.

## Before You Start

- Read [README.md](README.md), [AGENTS.md](AGENTS.md), and [MIGRATION.md](MIGRATION.md).
- Decide whether your change belongs to the legacy root app or `next-portfolio/` before editing.
- For non-trivial migration or redesign work, open an issue first.

## Local Setup

### Legacy root app

```bash
git clone https://github.com/zhenxiao-yu/M4rkyu.com.git
cd M4rkyu.com
npm install
npm start
```

### Next.js remake

```bash
cd next-portfolio
npm install
npm run dev
```

## Validation

### Legacy root app

```bash
npm run lint
npm run build
```

### Next.js remake

```bash
cd next-portfolio
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

## Contribution Rules

- Do not switch production from the legacy app to the Next.js remake without explicit approval.
- Do not mix unrelated legacy and remake changes in one PR.
- Keep personal addresses, phone numbers, and other private data out of source, screenshots, and generated assets.
- Update `README.md`, `MIGRATION.md`, and [CHANGELOG.md](CHANGELOG.md) when repo structure or launch status changes.

## Commit Style

Use conventional-style commit messages where possible:

```text
feat(next-portfolio): improve project story layout
fix(legacy): repair broken route on production-safe app
docs: clarify migration launch gates
```

## Pull Requests

Please include:
- which app you changed
- why the change was needed
- how you validated it
- screenshots for UI-visible changes

## Release Notes

Add notable migration, portfolio-content, or deployment-affecting changes to [CHANGELOG.md](CHANGELOG.md).
