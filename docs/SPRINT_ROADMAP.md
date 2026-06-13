# m4rkyu.com — 20-Sprint Roadmap to Site of the Month

> Pair every sprint with [`AGENT_OPERATING_PROMPT.md`](AGENT_OPERATING_PROMPT.md).
> Design + flagship work is front-loaded (S1–S9) because that is what wins
> galleries; content, completeness, and growth follow. Each sprint is ~1 coherent
> PR; reorder freely as feedback lands.

**Sprint anatomy:** Goal · Why high-impact · Key work · Files/areas · Skills ·
Validation · Done-when.

---

## Phase A — Design foundation & hero (S1–S4)

### S1 — Resolve the hero, kill the WIP limbo

- **Goal:** Commit ONE hero direction and finish it; clear the uncommitted
  `hero-wordmark`, `home-backdrop-switcher`, `iridescence`, `threads` files.
- **Why:** The landing is the gallery juror's first 3 seconds; the current
  half-committed state reads as unfinished.
- **Work:** Decide wordmark+backdrop vs. doctrine command-center (recommend:
  keep the OGL backdrop as atmosphere AND add a mono eyebrow + 1-line identity +
  two CTAs so a visitor gets _who/what_ immediately). Reduced-motion + touch +
  mobile defaults. Update the doctrine doc to match the shipped reality.
- **Files:** `src/components/sections/hero-section.tsx`, `hero-wordmark.tsx`,
  `home-backdrop-switcher.tsx`, `ui/magic/{iridescence,threads}.tsx`,
  `messages/*.json`, `docs/UNIFIED_VISUAL_DIRECTION.md`.
- **Skills:** `brainstorming`, `frontend-design`, `taste-check`, `a11y`.
- **Validation:** build + e2e smoke + Chrome DevTools perf trace on `/`.
- **Done-when:** hero is committed, intentional, fast (LCP < 2.5s), legible on
  mobile, reduced-motion-safe, EN/ZH parity.

### S2 — Ship the Numbered Capabilities section (load-bearing)

- **Goal:** Add the missing homepage spine: 5 numbered systems (Production
  engineering / Interface systems / Game feel / AI tools / Visual storytelling).
- **Why:** Without it the homepage shows atmosphere + work but never states the
  _range_. It's the Lambda-inspired narrative the doctrine is built on.
- **Work:** Build on shipped `NumberedCapability`; add the spec'd `PixelDivider`
  between rows; data-drive the five systems from `src/content`.
- **Files:** `src/app/[locale]/page.tsx`, `src/components/sections/*`,
  `src/components/ui/pixel/{numbered-capability,pixel-divider}.tsx`, content + messages.
- **Skills:** `frontend-design`, `taste-check`, `a11y`.
- **Done-when:** five rows live, dividers in, BlurFade-in, Storybook story, EN/ZH.

### S3 — Wire the sound system + tactile micro-moments

- **Goal:** Deliver the 4-cue Web Audio payload (click/confirm/scene-enter/error)
  behind the existing `SoundToggle`; wire to `PixelButton` + primary CTAs.
- **Why:** A reward-loop layer that feels alive — a site-specific "tell."
- **Work:** Flesh out `src/lib/audio/ui-sound.ts`; opt-in, off by default,
  reduced-motion/`prefers-reduced-motion` aware, no autoplay.
- **Files:** `src/lib/audio/*`, `src/components/system/sound-toggle.tsx`,
  `src/components/ui/pixel/pixel-button.tsx`.
- **Skills:** `frontend-design`, `a11y`, `test-gen` (audio module unit test exists — extend).
- **Done-when:** cues fire on intent, toggle persists, silent when off / reduced-motion.

### S4 — One signature scroll moment + route-transition polish

- **Goal:** Add exactly one memorable scroll moment (e.g. animated beam
  hero→capabilities, or a single tasteful pinned reveal) within budget.
- **Why:** The difference between "solid" and "memorable" in juror notes.
- **Work:** GSAP/motion within the no-scroll-jack rule; refine View Transitions.
- **Files:** `src/lib/gsap.ts`, relevant sections, `globals.css` tokens.
- **Skills:** `frontend-design`, `taste-check`, `perf-profile`.
- **Done-when:** one moment, ≤800ms, reduced-motion fallback, no CLS regression.

---

## Phase B — Flagship AI-native features (S5–S9)

### S5 — AI Portfolio Concierge ("ask my site anything")

- **Goal:** Streaming chat that answers from the actual content layer (RAG over
  `src/content/*` + posts/notes), grounded, cited, refusing to invent.
- **Why:** The standout, genuinely-useful AI feature; uses installed AI SDK 6 +
  `@ai-sdk/deepseek` (or AI Gateway `provider/model` string).
- **Work:** Server route with AI SDK streaming + tool-calling over a content
  index; `CommandConsole`-skinned UI; rate-limited (`src/lib/server/rate-limit.ts`);
  graceful no-key degrade. Read `vercel:ai-sdk` skill + `context7` AI SDK docs first.
- **Files:** new `src/app/[locale]/api/concierge/route.ts` (or `/api/`), AI lib
  under `src/lib/ai/`, console UI, content-index builder.
- **Skills:** `vercel:ai-sdk`, `vercel:nextjs`, `superpowers:brainstorming`,
  `security-reviewer` (prompt-injection, key safety).
- **Done-when:** grounded answers with links, refuses out-of-scope, rate-limited,
  reduced-motion, EN/ZH, no key → clean fallback.

### S6 — Command Console navigation (Cmd-K, skinned + AI-routed)

- **Goal:** Ship the spec'd `CommandConsole` skin over cmdk: jump to any route,
  run tools, theme/locale switch, and "ask" hand-off to the concierge.
- **Why:** Power-user navigation = a recurring SOTD signature; ties the system
  metadata aesthetic together.
- **Files:** `src/components/ui/pixel/command-console.tsx`, command registry,
  header + mobile-nav + ⌘K wiring.
- **Skills:** `frontend-design`, `a11y` (focus trap, ARIA), `test-gen`.
- **Done-when:** keyboard-complete, themed, actions work, e2e covers open/route/close.

### S7 — Generative / personalized share cards (OG v2)

- **Goal:** Upgrade OG to dynamic, per-entity, on-brand cards (riso palette,
  real titles, maybe per-visitor/topic variants).
- **Why:** Share surfaces are how galleries + social discover you.
- **Files:** `src/lib/seo/og-image.tsx`, `opengraph-image.tsx` handlers.
- **Skills:** `vercel:nextjs`, `taste-check`. (Keep no `runtime="edge"`.)
- **Done-when:** distinct branded cards per route, CJK glyphs render, snapshot-tested.

### S8 — Live surfaces (GitHub / now / activity)

- **Goal:** Real-time "alive" signals: GitHub activity, now-playing/now-building,
  coding stats, status pulse — cached + graceful.
- **Why:** Proof-of-life beats static; the `StatusPulse` primitive already exists.
- **Files:** `src/lib/server/*` fetchers (GitHub/Steam sync routes exist —
  extend), a `/now`-style surface, homepage status strip.
- **Skills:** `vercel:nextjs` (cache components), `dep-audit`, `security-reviewer`.
- **Done-when:** cached (no rate-limit blowups), degrades offline, EN/ZH.

### S9 — Interactive playgrounds

- **Goal:** Turn the 35+ in-browser resource tools into showcased live demos and
  add 1 flagship interactive (e.g. a sandboxed code/shader playground).
- **Why:** "Try it here" interactivity is sticky and demonstrates craft.
- **Files:** `src/components/tools/*`, `resources/[slug]`, new playground route.
- **Skills:** `frontend-design`, `perf-profile` (lazy-load heavy demos).
- **Done-when:** demos lazy-loaded, mobile-usable, no bundle-budget breach.

---

## Phase C — Content & asset pipelines (S10–S13)

### S10 — Gallery pipeline + real photography live

- **Goal:** Move gallery items from 0% → real; EXIF (`exifr` installed),
  blur-data, collections populated, save-to-account ready.
- **Files:** `src/content/gallery.ts`, `ArchiveTile`, asset pipeline scripts.
- **Skills:** `asset-audit`, `content-audit`.
- **Done-when:** ≥2 collections fully real.

### S11 — Media production surface

- **Goal:** Populate reels/process/posters; real posters + captions; empty-state
  only where genuinely pending.
- **Files:** `src/content/media.ts`, media section/route.
- **Skills:** `content-audit`.

### S12 — Games + real project screenshots

- **Goal:** De-stub games (dedupe "Descent Into Madness"), add real metadata;
  replace placeholder project SVGs with real screenshots.
- **Files:** `src/content/{games,projects}.ts`, covers.
- **Skills:** `content-audit`, `taste-check`.

### S13 — Shop launch (Stripe end-to-end)

- **Goal:** Promote ≥3 products draft→ready; verify cart→Stripe→success→email
  webhook; physical vs digital paths.
- **Files:** `src/content/shop.ts`, shop routes, `/api/webhooks/stripe`.
- **Skills:** `stripe:stripe-best-practices`, `security-reviewer` (webhook sig).
- **Done-when:** test-mode purchase completes both paths; receipts send.

---

## Phase D — Engineering completeness (S14–S17)

### S14 — Admin CMS completion

- **Goal:** Finish server actions + revalidation for all content CRUD; batch
  publish/archive; optimistic UI.
- **Files:** `src/app/[locale]/admin/**`, server actions, `revalidatePath`.
- **Skills:** `vercel:nextjs` (server actions), `security-reviewer` (authz), `test-gen`.

### S15 — Comments + light community

- **Goal:** Public comment threads on posts/notes with moderation
  (`/admin/comments` exists); rate-limited, spam-guarded.
- **Skills:** `security-reviewer`, `a11y`.
- **Done-when:** post/read/moderate works, RLS verified.

### S16 — Cross-device sync + account settings

- **Goal:** Migrate saved items localStorage→Supabase with merge; finish
  `/account/settings`.
- **Files:** save hooks, Supabase tables/RLS, account routes.
- **Skills:** `test-gen`, `security-reviewer`.

### S17 — Native writing/editor (reduce dev.to coupling)

- **Goal:** First-class local posts (MDX/markdown via installed remark/shiki),
  dev.to as secondary with correct canonical attribution.
- **Files:** content/post pipeline, `logs` route, structured data.
- **Skills:** `vercel:nextjs`, `seo`.

---

## Phase E — Quality, performance, growth (S18–S20)

### S18 — SEO depth + i18n content translation

- **Goal:** Enrich Person/Organization schema, breadcrumbs on index pages,
  resolve www/apex, fix duplicate message keys; translate key content (not just
  chrome) for ZH.
- **Files:** `src/lib/seo/*`, `messages/*`, content translations.
- **Skills:** `i18n-localization`, `localize`.
- **Done-when:** rich-results valid, ZH real.

### S19 — Performance, a11y, and test depth

- **Goal:** LCP/CLS/INP budgets in CI; lazy-split GSAP/OGL/Leaflet; visual
  regression (Chromatic-style) + axe in Storybook (`test:"todo"`→on); journey
  e2e (signup→save→comment).
- **Files:** `next.config.ts` (Red — propose first), `.storybook/*`, CI, tests.
- **Skills:** `perf-profile`, `a11y`, `test-gen`, Chrome DevTools MCP `lighthouse_audit`.
- **Done-when:** Lighthouse ≥95 mobile, budgets enforced, a11y automated.

### S20 — Observability, growth, and SOTD submission polish

- **Goal:** Analytics funnels (signup/save/shop), error monitoring, newsletter
  loop, final `release-check`; prepare Awwwards/CSSDA/SOTD submission assets.
- **Files:** analytics wrappers, monitoring, `feed.*`, release docs.
- **Skills:** `release-check`, `product-polish`, `taste-check`.
- **Done-when:** funnels tracked, monitoring live, submission kit ready.

---

## Cross-sprint cadence

- One coherent PR per sprint; `npm run validate && npm run build && npm run test:e2e`
  before opening. `sprint-status` at start, `code-review` before merge.
- Reassess after every 5 sprints with `scope-check`; reorder by feedback + impact.

## Open forks to settle early

- **Hero direction** (S1) — wordmark+backdrop vs. command-center. Recommend a
  hybrid; decide and commit in S1, then update `docs/UNIFIED_VISUAL_DIRECTION.md`
  to match the shipped reality.
- **AI provider** (S5) — DeepSeek direct (installed) vs. Vercel AI Gateway
  `provider/model` string; decide based on cost/latency.
