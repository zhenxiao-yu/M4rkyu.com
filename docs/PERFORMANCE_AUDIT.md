# Performance Audit

Surgical audit of M4RKYU.SYS first-load performance. No redesign, no
new dependencies, no removal of the cyber-pixel system. Findings and
fixes target initial JS, image strategy, atmospheric effects, fonts,
and per-route budgets.

## 1. Measurement constraints

- **Local production build (Windows, H: drive):** blocked by a known
  `readlink EISDIR` on `src/app/robots.ts` regardless of
  `NEXT_DIST_DIR`. Same caveat documented in [CLAUDE.md](../CLAUDE.md).
- **CI / Vercel build:** green on every recent PR — bundle sizes
  recorded there are the source of truth. Re-measure against the
  Vercel preview deployed for this PR.
- **Speed Insights:** `@vercel/speed-insights` is already wired into
  the root layout — field data accumulates on production.
- **Lighthouse:** must be run against the Vercel preview (local build
  blocked).

This audit therefore relies on (a) the most recent CI build output,
(b) static analysis of the source tree, (c) explicit reasoning about
what is and is not in the initial JS payload.

## 2. Likely LCP element per route

| Route        | Likely LCP element                              | Strategy in place |
| ------------ | ----------------------------------------------- | ----------------- |
| `/`          | `<h1>` headline inside `HeroSection`            | Text. No image to prioritize. `BlurFade` wraps the column — animates after hydration, not before paint. |
| `/work`      | Section heading + first project tile            | Text + lazy `next/image` for tile thumbs. |
| `/work/[slug]` | Cover image in case-study hero                | `priority` set on the cover `<Image>` ([work/[slug]/page.tsx:113](../src/app/[locale]/work/[slug]/page.tsx#L113)). |
| `/archive`   | First gallery tile (above the fold)             | `<Image fill sizes=...>`, no `priority`. Acceptable: text heading paints first; tile fades in. |
| `/archive/[collection]` | Collection hero image                | `<Image fill sizes=...>`. Add `priority` for first tile when collection has a hero — TODO follow-up. |
| `/logs`      | Pinned post card hero                            | `<Image>` with `sizes`. Adequate. |
| `/logs/[slug]` | Post hero / first inline image                 | Markdown-driven; first image is lazy-loaded via `post-body.tsx`. |
| `/games`     | First game tile                                  | Lazy image. |
| `/games/[slug]` | Cover image                                   | `priority` set ([games/[slug]/page.tsx:100](../src/app/[locale]/games/[slug]/page.tsx#L100)). |
| `/portal`    | Particles canvas + headline text                 | Canvas mounts post-hydration; text is LCP. |

## 3. INP risks

- **Lenis smooth scroll** (`src/providers/smooth-scroll.tsx`) runs a
  `requestAnimationFrame` loop on every route, no
  `prefers-reduced-motion` gate. Intercepts scroll/wheel events on
  every viewport. **Fix below.**
- **Particles canvas** ([particles.tsx](../src/components/ui/magic/particles.tsx))
  already short-circuits on reduced motion and is canvas-based, not
  DOM. Scoped to `/portal`. **OK.**
- **CommandPalette** mounts cmdk + `lucide-react` icons + the entire
  `galleryItems` content payload in the initial bundle on every route
  because `CommandPaletteProvider` statically imports
  `CommandPalette`. **Fix: lazy-load via `next/dynamic`.**
- **StatusPulse halo** ([status-pulse.tsx](../src/components/ui/pixel/status-pulse.tsx))
  short-circuits on reduced motion. Halo lives next to status text;
  not infinite offscreen. **OK.**
- **`IntroLoader`** is a one-shot, session-gated full-viewport
  overlay. On repeat visits it skips entirely; on reduced motion it
  skips entirely. Component code lives in its own client chunk
  (Next splits "use client" components by default). Marginal
  savings from further deferral did not justify the wrapper-file
  cost. **Left as-is. Re-evaluate if Lighthouse flags it.**

## 4. CLS risks

- All `next/image` usage either uses `fill` inside an aspect-locked
  container OR explicit `width`/`height` (post-body Markdown images).
  No raw `<img>` tags. **OK.**
- Fonts: `next/font/google` with the default `display: swap`. Latin
  subsets only, CJK on system fallback by design. Variables on
  `<html>` so no shift on hydration. **OK.**
- `IntroLoader` returns `null` on SSR and only mounts after
  hydration — no CLS, no reserved space.

## 5. Heavy client components (initial bundle inventory)

Mounted in the root layout, ships on every page:

- `SmoothScroll` → pulls **Lenis (~13 KB gz)** plus a RAF loop.
- `Analytics` + `SpeedInsights` (Vercel, server-rendered shells).

Mounted in `[locale]/layout.tsx`, ships on every locale page:

- `NextIntlClientProvider` — required for client `useTranslations`.
- `ThemeProvider` (`next-themes`) — required for dark/light.
- `TooltipProvider` (Radix) — required for any `<Tooltip>` consumer.
- `CommandPaletteProvider` → statically imports `CommandPalette`,
  which pulls in **cmdk + 14 lucide icons + Radix Dialog + the entire
  `galleryItems` content payload + `PalettePost` slice**. The dialog
  body only renders when `open=true`, but the JavaScript ships
  regardless.

Per-page hot spots:

- `/archive` eagerly imports `GalleryLightbox` (Dialog + Image +
  per-frame logic) even though the lightbox only opens on click.
- `/` eagerly imports `IntroLoader` (motion + AnimatePresence) even
  though it only renders on the first visit of a session.

## 6. Heavy media

- No above-the-fold full-bleed hero image anywhere. The home hero is
  type-first. Other hero routes set `priority` on the LCP image
  correctly.
- Gallery uses `<Image fill>` thumbnails with `grayscale` filter +
  scale on hover. Lightbox loads full-size images only when opened.
- dev.to-syndicated Markdown images route through `next/image` with
  remote-pattern config in `next.config.ts` — Next optimizes them.

## 7. Third-party scripts

- `@vercel/analytics` and `@vercel/speed-insights` — both inject a
  tiny script only on production. Acceptable.
- `dev.to` API is server-side fetched (`src/lib/blog/devto.ts`) and
  cached. No client request.
- No Google Analytics, no Sentry, no Intercom, no tag manager.

## 8. Atmospheric effects audit

| Effect | Location | Status |
| ------ | -------- | ------ |
| `noise-layer` + `scanline-layer` | hero section | CSS-only. No JS cost. |
| `Particles` canvas | `/portal` only | Reduced-motion gated. Canvas, not DOM. |
| `PixelTransitionOverlay` | route transitions | Reduced-motion → returns null. Phase-9 fix. |
| `StatusPulse` halo | status badges | Reduced-motion skips halo. Phase-9 fix. |
| Lenis smooth scroll | every route | **No reduced-motion gate.** Fix below. |
| `BlurFade`, `FadeIn`, `Stagger` | content sections | `BlurFade` uses `useReducedMotion`. Others use `viewport whileInView` — animations only fire on visible content, so offscreen sections don't run. |

## 9. Fonts

- `Geist`, `Geist_Mono`, `Syne`, `VT323` — all via `next/font/google`.
- All subsets restricted to `["latin"]`. CJK uses system fallback by
  design (per [globals.css](../src/app/globals.css) `:lang(zh)` guard).
- Default `display: swap` is correct for portfolio use (no FOIT).
- No new font additions planned.

## 10. Prioritized fixes (this PR)

The fixes below are all surgical, behavior-preserving, and do not
touch the visual direction.

### F.1 — Defer Lenis until after first paint

`SmoothScroll` currently imports `lenis` statically at module load.
With `next/dynamic` infrastructure-only changes inside the existing
client component, we switch to a dynamic `import()` inside the
effect so the ~13 KB Lenis chunk is requested by the browser only
**after hydration**, not as part of the initial JS bundle. We also
short-circuit when `prefers-reduced-motion: reduce` is set — no
Lenis import at all, no RAF loop, native scroll restored.

### F.2 — Lazy-load `CommandPalette` body

`CommandPaletteProvider` keeps the event listener (the Cmd+K hotkey
that runs cheaply on `keydown`) but the `<CommandPalette>` dialog
becomes a `next/dynamic` import with `ssr: false`, loaded the first
time `open` flips to `true`. This pulls cmdk, the 14 lucide icons,
Radix Dialog, and the `galleryItems` payload out of the initial
bundle on **every page**.

### F.3 — Lazy-load `GalleryLightbox`

Same pattern. `archive/_client.tsx` (and `saved/page.tsx`) only need
the lightbox when a user clicks a frame. Wrap in `next/dynamic` so
the lightbox bundle is fetched on first interaction.

### F.4 — `compiler.removeConsole` in production

Add `compiler: { removeConsole: { exclude: ["error", "warn"] } }`
to `next.config.ts`. Strips development logs from production
client bundles. Negligible per file, but the codebase has scattered
`console.log` calls in motion components and providers.

## 11. Route budgets

These are the initial-JS budgets the project should hold against on
the Vercel build output. They are *advisory*, not enforced in CI yet.
A future PR can wire a CI guardrail.

| Route                  | First-load JS (target) | Notes |
| ---------------------- | ---------------------- | ----- |
| `/` (home)             | ≤ 220 KB               | Includes shared chunk + intl + theme + nav. After F.2. |
| `/work`                | ≤ 200 KB               | Server-rendered list + tiny client filter. |
| `/work/[slug]`         | ≤ 215 KB               | Adds case-study cover image priority. |
| `/archive`             | ≤ 210 KB               | After F.3 (lightbox lazy). |
| `/archive/[collection]`| ≤ 215 KB               | After F.3. |
| `/archive/saved`       | ≤ 210 KB               | After F.3. |
| `/logs`                | ≤ 215 KB               | Post timeline + toolbar. |
| `/logs/[slug]`         | ≤ 225 KB               | Reading-progress + post body (shiki is server-only). |
| `/games`               | ≤ 200 KB               | Server-rendered list. |
| `/portal`              | ≤ 220 KB               | Includes particles canvas. |
| `/contact`             | ≤ 200 KB               | Tiny form. |

**Shared baseline (loaded on every route):** ≤ 95 KB. After
F.1/F.2 this should drop because Lenis + cmdk + lucide-react are
not in the shared chunk anymore.

## 12. Things explicitly NOT changed

- Cyber-pixel design system: untouched.
- Visual direction (UNIFIED_VISUAL_DIRECTION.md): untouched.
- Particles, scanlines, noise, pixel transitions: untouched
  (already reduced-motion-aware).
- Fonts, typography, spacing, color tokens: untouched.
- Routes, IA, nav structure: untouched.
- Dependencies: nothing added, nothing removed.

## 13. Follow-ups (next PR, not this one)

- Wire `@next/bundle-analyzer` as a dev-only opt-in (`ANALYZE=true
  npm run build`) — useful but adds a devDependency, defer to a
  dedicated PR.
- Enforce route budgets via CI (e.g. a small script that parses the
  Next build output and fails on regression).
- Audit `motion` usage and consider `LazyMotion` + feature loading
  for the home and `/portal` routes if Lighthouse still flags
  unused JS after F.1–F.5.
- Confirm Vercel CDN is serving `image/avif` to Lighthouse — the
  `formats` array already prefers AVIF.
- Add `priority` to the first `archive/[collection]` hero image if
  user testing shows that tile is the LCP.

## 14. Verification

After this PR lands, against the Vercel preview:

- Run Lighthouse on `/en` and `/zh` desktop + mobile profiles.
- Compare first-load JS in Vercel build log against budgets in §11.
- Confirm Speed Insights field data over 7 days.
- Smoke test the Cmd+K palette and gallery lightbox to confirm
  lazy chunks load on first interaction.
