# M4rkyu.com 2027 Remake Migration

## Current Safety State

- Active remake branch: `remake/nextjs-2027`.
- Legacy production is preserved in the existing root mixed Vite/partial Next app.
- The new app lives in `next-portfolio`.
- No production deployment rewrite has been made.
- Personal phone number and home address must not migrate into the remake.

## Milestone 1 Implemented

- Fresh isolated Next.js App Router app in `next-portfolio`.
- The remake is pinned to Next 15.5.15 after Next 16.2 local builds hit Windows filesystem lock/snapshot issues in this repo.
- Local Next build output uses ignored `next-portfolio/.next-node22` to avoid Windows lock conflicts; Vercel keeps the default `.next` output.
- Build verification should run on Node 20/22; Node 24 in this shell triggered Webpack filesystem `readlink` errors.
- TypeScript strict mode, Tailwind CSS 4, shadcn-style owned UI primitives.
- Theme architecture for `dark`, `light`, and `monochrome`.
- `next-intl` locale routes for `/en` and `/zh`.
- Structured local content with Zod schemas.
- Homepage shell, responsive nav, project archive, project detail, gallery shell, blog shell, resources/tools shell, contact, about, and `/portal`.
- Storybook and Playwright scaffolding.
- SEO foundation: metadata, static robots/sitemap, canonical-ready localized routes.

## Phase II Prototype Implemented

- Full visual prototype layer added across homepage, projects, project detail, games, gallery, blog/devlog, media, resources, tools, about, contact, and portal.
- Structured placeholder datasets now exist for projects, gallery items, posts, games, media, services, resources, and profile content.
- Placeholder content is explicitly marked with `TBD`, `Placeholder`, `Draft`, `Coming soon`, or `Replace with final content`.
- Added reusable placeholder primitives: `PlaceholderImage`, `PlaceholderVideo`, `PlaceholderCard`, `DraftBadge`, `ComingSoonBlock`, `EmptyArchiveState`, `MediaFrame`, and `ContentPendingLabel`.
- Added `/games`, `/games/[slug]`, and `/media` as lightweight static prototype routes.
- Expanded Storybook coverage for placeholder states and archive cards.
- Expanded Playwright smoke coverage across 96 route/viewport checks.
- No fake metrics, clients, awards, private phone number, or home address were introduced.

## Launch Gates

- `npm run build` passes in `next-portfolio`.
- `npm run lint` and `npm run typecheck` pass.
- Storybook renders foundations, UI, cards, layout, and section states.
- Playwright smoke tests pass across mobile and desktop widths.
- No private phone number or home address appears in remake source/content.
- Vercel deployment remains pointed at legacy production until explicitly changed.

## Verification Notes

- `npm run lint` passes in `next-portfolio`.
- `npm run typecheck` passes in `next-portfolio`.
- `npm run build`, `npm run build-storybook`, and `npm run test:e2e` pass from a clean C: temp copy at `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-build`.
- Playwright smoke coverage currently checks `/en`, `/en/projects`, `/en/projects/nimbus`, `/en/about`, `/en/portal`, theme controls, language controls, and horizontal overflow at 360, 390, 768, 1280, 1920, and desktop Chromium widths.
- Phase II verification also passed from `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-phase2`: `npm run build`, `npm run build-storybook`, and `npm run test:e2e` with 96/96 Playwright checks.
- Phase II smoke coverage includes `/en`, `/zh`, `/en/projects`, `/en/projects/nimbus`, `/en/games`, `/en/games/descent-into-madness`, `/en/gallery`, `/en/gallery/black-white`, `/en/blog`, `/en/media`, `/en/resources`, `/en/tools`, `/en/about`, `/en/contact`, `/en/portal`, theme controls, language controls, and horizontal overflow at 360, 390, 768, 1280, 1920, and desktop Chromium widths.
- The H: workspace currently has Windows filesystem lock/readlink issues against generated directories such as `.next-node22` and `storybook-static`; keep generated output ignored and verify builds from C: or CI until the drive state is cleaned.
- Local dev can avoid the locked default output by setting `NEXT_DIST_DIR`, for example `NEXT_DIST_DIR=.next-dev-3000 npm run dev -- --hostname 127.0.0.1 --port 3000`.
- The C: temp verification path can also leave native Node module files locked briefly after build/test runs; use a fresh temp folder or CI for repeated clean-copy verification if Windows refuses cleanup.
- After adding configurable `NEXT_DIST_DIR`, a clean-copy `npm run build` pass was verified again from `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-configcheck-*`.
- `npm ci` reports 2 moderate audit findings in the current dependency tree; review before release, but do not use forced breaking upgrades inside Milestone 1.

## Next Batches

- Replace placeholder project copy with approved case-study writing.
- Replace SVG/placeholders with optimized real screenshots, artwork, video posters, and captions.
- Add gallery lightbox and thumbnail pipeline.
- Add MDX posts and Pagefind indexing.
- Add contact form provider once content and launch flow are stable.
- Run Lighthouse and accessibility review on a Vercel preview.
