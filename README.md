# M4rkyu.com

Personal portfolio for Zhenxiao (Mark) Yu — live at
[m4rkyu.com](https://m4rkyu.com).

The legacy Vite + React 18 site that previously held this domain has been
archived to [zhenxiao-yu/m4rkyu-archive](https://github.com/zhenxiao-yu/m4rkyu-archive)
and is reachable on a free `*.vercel.app` URL for rollback.

## Stack

- Next.js App Router with locale routes for `/en` and `/zh`.
- TypeScript end-to-end.
- `next-intl` for routing and message catalogs.
- Tailwind CSS 4 with owned shadcn/Radix-style UI primitives.
- Zod content schemas for structured portfolio data.
- Storybook for component states.
- Playwright for route smoke coverage.

## Local Development

```bash
npm install
npm run dev
```

If a Windows `.next` filesystem lock blocks dev, run with an isolated output
directory:

```powershell
$env:NEXT_DIST_DIR = ".next-dev-3000"
npm run dev -- --hostname 127.0.0.1 --port 3000
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

`npm run test:e2e` starts a Next dev server with
`NEXT_DIST_DIR=.next-playwright` and checks the route matrix across 360, 390,
768, 1280, 1920, and desktop Chromium widths.

## Deployment

`main` auto-deploys to the `m4rkyu-portfolio` Vercel project, which serves
`m4rkyu.com` and `www.m4rkyu.com` from the latest production build.

## Content Safety

Keep private phone numbers, home addresses, and other personal contact details
out of source, fixtures, screenshots, and generated assets. Use approved public
contact channels only.

## License

MIT — see [LICENSE](LICENSE).
