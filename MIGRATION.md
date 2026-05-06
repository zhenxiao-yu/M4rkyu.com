# M4rkyu.com 2027 Remake Migration

## Current Safety State

- Active remake branch: `remake/nextjs-2027`.
- Legacy production is preserved in the existing root Vite + React app.
- The new app lives in `next-portfolio`.
- Primary local workspace moved to `E:\Github\M4rkyu.com` after H: filesystem locks caused unreliable local Next build output.
- No production deployment rewrite has been made.
- Personal phone number and home address must not migrate into the remake.

## Milestone 1 Implemented

- Fresh isolated Next.js App Router app in `next-portfolio`.
- The remake is pinned to Next 15.5.15 after Next 16.2 local builds hit Windows filesystem lock/snapshot issues in this repo.
- Local Next build output uses ignored `next-portfolio/.next-node22` to avoid Windows lock conflicts; Vercel keeps the default `.next` output.
- Build verification should run on Node 22; the Next app declares `engines.node = 22.x` so Vercel and local verification stay aligned.
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

## Phase III Interaction and Pipeline Implemented

- Completed current UI polish pass in the Next remake using the owned shadcn/Radix-style primitives already in the app.
- Project archive now has URL-aware category and search filters via `?category=` and `?q=`.
- Resource library now has URL-aware category and search filters rather than a placeholder search field.
- Gallery grid now opens a keyboard-navigable dialog with shareable `?frame=` state.
- Contact page now validates fields and opens a prefilled mailto flow, keeping email as the production-safe path until a server provider is selected.
- Fixed motion-related mobile horizontal overflow by removing horizontal entrance transforms from shared reveal animations.
- Tightened hero and section heading type scale to avoid viewport-scaled typography overflow.
- Hardened the marquee strip against mobile scroll-width expansion.
- Added a narrow npm `overrides` entry for `postcss@8.5.10`, clearing the current moderate npm audit finding without using the unsafe forced downgrade suggested by `npm audit fix --force`.
- Added root GitHub Actions workflow `.github/workflows/next-portfolio-ci.yml` scoped to `next-portfolio/**`.
- Playwright now uses `NEXT_DIST_DIR=.next-playwright` to isolate test dev-server artifacts from production build output.
- Added `next-portfolio/vercel.json` so Vercel uses `npm ci`, `npm run build`, and the Next.js framework preset deterministically.

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
- `npm audit --audit-level=moderate` passes in `next-portfolio`.
- `npm run build`, `npm run build-storybook`, and `npm run test:e2e` pass from a clean C: temp copy at `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-build`.
- Playwright smoke coverage currently checks `/en`, `/en/projects`, `/en/projects/nimbus`, `/en/about`, `/en/portal`, theme controls, language controls, and horizontal overflow at 360, 390, 768, 1280, 1920, and desktop Chromium widths.
- Phase II verification also passed from `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-phase2`: `npm run build`, `npm run build-storybook`, and `npm run test:e2e` with 96/96 Playwright checks.
- Phase II smoke coverage includes `/en`, `/zh`, `/en/projects`, `/en/projects/nimbus`, `/en/games`, `/en/games/descent-into-madness`, `/en/gallery`, `/en/gallery/black-white`, `/en/blog`, `/en/media`, `/en/resources`, `/en/tools`, `/en/about`, `/en/contact`, `/en/portal`, theme controls, language controls, and horizontal overflow at 360, 390, 768, 1280, 1920, and desktop Chromium widths.
- The H: workspace currently has Windows filesystem lock/readlink issues against generated directories such as `.next-node22` and `storybook-static`; keep generated output ignored and verify builds from C: or CI until the drive state is cleaned.
- Local dev can avoid the locked default output by setting `NEXT_DIST_DIR`, for example `NEXT_DIST_DIR=.next-dev-3000 npm run dev -- --hostname 127.0.0.1 --port 3000`.
- The C: temp verification path can also leave native Node module files locked briefly after build/test runs; use a fresh temp folder or CI for repeated clean-copy verification if Windows refuses cleanup.
- After adding configurable `NEXT_DIST_DIR`, a clean-copy `npm run build` pass was verified again from `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-configcheck-*`.
- Phase III verification passed locally in the workspace for `npm audit --audit-level=moderate`, `npm run lint`, and `npm run typecheck`.
- Phase III clean-copy verification passed from `C:\Users\YZX06\AppData\Local\Temp\m4rkyu-next-portfolio-codex-20260504213305`: `npm ci`, `npm run build`, `npm run build-storybook`, and `npm run test:e2e` with 96/96 checks.
- Direct `npm run build` on H: can still hit the documented Windows `readlink` issue; clean C: copies and CI remain the reliable verification path until the drive state is cleaned.
- E: workspace verification passed directly from `E:\Github\M4rkyu.com\next-portfolio`: `npm ci`, `npm audit --audit-level=moderate`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run build-storybook`, and `npm run test:e2e` with 96/96 checks.
- Vercel project `m4rkyu-next-preview` is linked under team `zhenxiaoyus-projects`, root directory `next-portfolio`, and GitHub repo `zhenxiao-yu/M4rkyu.com` on branch `remake/nextjs-2027`.
- The preview project was renamed from `m4rkyu-remake-preview` and now has the clean alias `https://m4rkyu-next-preview.vercel.app`.
- The most recent remote Vercel error was from the previous commit before the Motion easing fix; pushing this commit should trigger a fresh GitHub-connected preview build.

## Next Batches

- Vercel dashboard cleanup: use `VERCEL_DASHBOARD_AUDIT.md` to approve project renames, archive/delete candidates, and the eventual `m4rkyu.com` cutover.
- Content lock: replace placeholder project copy with approved case-study writing, prioritizing Nimbus, BioLoom, and M4rketView.
- Media lock: replace SVG/placeholders with optimized real screenshots, artwork, video posters, and captions; define image naming, alt text, dimensions, and compression budgets.
- Gallery pipeline: add final thumbnail generation, EXIF-safe metadata stripping, real collection covers, and collection-level metadata.
- Writing/search: add MDX posts, then Pagefind indexing once the content set is stable.
- Contact provider: select Resend, Tally, Formspree, or a Vercel-backed route handler after launch flow and spam policy are decided.
- Preview review: deploy a Vercel preview, run Lighthouse/accessibility review, check metadata/social cards, then decide whether to repoint production.
