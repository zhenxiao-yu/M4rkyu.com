# M4rkyu.com Next Portfolio

The isolated Next.js remake of M4rkyu.com. The legacy Vite app remains at the
repository root; this app is the migration target for the 2027 portfolio refresh.

## Stack

- Next.js App Router with locale routes for `/en` and `/zh`.
- Tailwind CSS 4 with owned shadcn/Radix-style UI primitives.
- `next-intl` for routing/messages.
- Motion helpers with reduced-motion safety and no mobile horizontal overflow.
- Storybook for component states and Playwright for route smoke coverage.

## Local Development

```bash
npm install
npm run dev
```

If the H: workspace hits Windows `.next` filesystem locks, run dev with an
isolated output directory:

```bash
$env:NEXT_DIST_DIR=".next-dev-3000"; npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Verification

```bash
npm audit --audit-level=moderate
npm run lint
npm run typecheck
npm run build
npm run build-storybook
npm run test:e2e
```

`npm run test:e2e` starts a Next dev server with `NEXT_DIST_DIR=.next-playwright`
and checks the current route matrix across 360, 390, 768, 1280, 1920, and desktop
Chromium widths.

## Migration Focus

The current phase turns the prototype shell into a usable portfolio surface:

- URL-aware project/resource filters.
- Gallery lightbox with keyboard navigation and shareable `?frame=` state.
- Contact form that validates input and opens a prefilled email until a server
  provider is selected.
- CI gate for audit, lint, typecheck, app build, Storybook build, and smoke tests.
- Vercel project config pins `npm ci`, `npm run build`, and Node 22 through
  `package.json` engines.

Keep private phone/address details out of this app. Replace placeholder copy and
media only after final content review.

## Deploy

Do not repoint production automatically. Create a Vercel preview from this app
first, run Lighthouse/accessibility review, then switch routing only after the
launch gates in `../MIGRATION.md` are satisfied.
