---
title: M4rkyu.com — Phase 8 QA audit
status: living
audience: design + implementation agents (Claude, Codex, human collaborators)
last_updated: 2026-05-11
related: docs/UNIFIED_VISUAL_DIRECTION.md §11
---

# Phase 8 QA audit — findings + remediation log

Phase 8 of [docs/UNIFIED_VISUAL_DIRECTION.md](./UNIFIED_VISUAL_DIRECTION.md)
fans three parallel read-only audits across everything shipped in Phases 1–7:

- **A11y + responsive** — focused on the new pixel layer + the rebuilt
  hero / capabilities / project surfaces.
- **Bilingual parity** — `messages/en.json` vs `messages/zh.json` key
  parity + English leaks in JSX.
- **Token + perf hygiene** — bans on raw hex, palette names, invalid
  Tailwind v4 transitions, stale imports, beam saturation.

This document logs each finding, marks status (`fixed in this PR` /
`deferred`), and points the deferred items at follow-up issues.

---

## Summary

| Severity | Total | Fixed in Phase 8 | Fixed in follow-up | Deferred |
| --- | --- | --- | --- | --- |
| BLOCK | 3 | 3 | 0 | 0 |
| SHOULD-FIX | 6 | 3 | 1 | 2 |
| NIT | 7 | 0 | 1 | 6 |

The follow-up PR (`chore(qa): phase-8 audit cleanup`) closed two more
items: SystemBadge default labels now translate via a new `Status`
namespace at the call sites, and CommandHero's `status.accessibleLabel`
became required (with `badgeLabel`) so the English `Open ${label}`
fallback is gone.

The remaining NIT row's "Fixed: 0" entry is the bilingual parity check
itself — a *finding* (no issue found), not a remediation; it stays in
the audit log for traceability but didn't require code.

---

## 1 — Fixed in this PR

### BLOCK · A11y · PixelPanel heading level locked to `<h2>`
- **Files:** `src/components/ui/pixel/pixel-panel.tsx`, `src/components/sections/command-hero.tsx`
- **Finding:** PixelPanel hardcoded `<h2>` for every titled panel. CommandHero
  rendered `<PixelPanel title="v2027">` inside the hero — yielding two `<h2>`
  elements directly under the page `<h1>` ("v2027" + "Systems & surfaces"),
  with no semantic intent.
- **Fix:** Added a `headingLevel?: 2 | 3` prop (default 2) to PixelPanel.
  CommandHero passes `headingLevel={3}`. Document outline now flows
  `h1 (hero) → h2 (capabilities section) → h3 (CommandHero v2027 + capability rows)`.

### BLOCK · A11y · SystemBadge `role="status"` on static chips
- **File:** `src/components/ui/pixel/system-badge.tsx`
- **Finding:** Every `kind="live"` / `kind="now"` SystemBadge wore
  `role="status"` + `aria-live="polite"`. CommandHero's static "Now" chip
  triggered an SR announcement on every focus / SR navigation pass even though
  the label never updates.
- **Fix:** Added a `live?: boolean` opt-in (default `false`). The pulsing
  halo still renders for `live`/`now` kinds (purely visual), but the live-region
  attributes only apply when consumers explicitly pass `live={true}`. No current
  call site needs that — all chips are static.

### BLOCK · Hygiene · Invalid Tailwind v4 transition syntax in 4 components
- **Files:** `archive-card.tsx:32`, `project-card.tsx:48`,
  `resource-preview-card.tsx:22`, `case-study-footer.tsx:86`
- **Finding:** Four legacy components used `transition-[border-color,box-shadow]`
  / `transition-[border-color,transform,box-shadow]` — comma-separated arbitrary
  values which `docs/AI_WORKFLOW.md §4` explicitly bans (invalid in Tailwind v4).
- **Fix:** Replaced each with the plain `transition` utility, which in v4's
  default set covers `color, background-color, border-color, text-decoration-color,
  fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter` — so
  hover transitions still animate the same properties without the invalid
  arbitrary syntax.

### SHOULD-FIX · A11y · NumberedCapability `aria-label` replaced visible title
- **File:** `src/components/ui/pixel/numbered-capability.tsx`
- **Finding:** When `cta` was set, the title `<Link>` carried
  `aria-label={cta.label}`. `aria-label` *replaces* the accessible name for
  AT users — so screen-reader users would hear "Read more" instead of the
  capability title (e.g. "Production engineering").
- **Fix:** Dropped the `aria-label`. The visible title text inside the link
  now serves as the accessible name. `cta.label` stays in the type for future
  variants (e.g. tooltip text).

### SHOULD-FIX · Bilingual · `aria-label="System status"` hardcoded English in GameHud
- **Files:** `src/components/sections/game-hud.tsx`, `src/components/sections/hero-section.tsx`, `messages/en.json`, `messages/zh.json`
- **Finding:** `<nav aria-label="System status">` was hardcoded English. ZH-route
  AT users heard the English landmark name.
- **Fix:** Added a `Hud.systemStatus` translation key (EN: "System status",
  ZH: "系统状态"). HeroSection passes `ariaLabel={tHud("systemStatus")}` to
  GameHud.

### SHOULD-FIX · Bilingual · `PROJECT MEDIA TBD` placeholder hardcoded English
- **Files:** `src/components/ui/pixel/mission-module-card.tsx`, `src/components/cards/project-card.tsx`, `messages/en.json`, `messages/zh.json`
- **Finding:** Both card variants passed `label="PROJECT MEDIA TBD"` literally
  to `PlaceholderImage`. ZH-route users saw English placeholder copy when a
  project had no cover screenshot.
- **Fix:** Added `Projects.mediaTbd` key (EN: "PROJECT MEDIA TBD", ZH: "项目素材待补"). MissionModuleCard converted to `async` to call
  `getTranslations({ namespace: "Projects" })`. project-card.tsx (already
  `"use client"` + `useTranslations`) uses `t("mediaTbd")`.

### NIT · Bilingual · Translation parity verified clean
- **Result:** EN/ZH JSON files are 1:1 — identical nesting, no value-type
  swaps, no English placeholders in zh values. All `Home.capabilities.*`
  entries are genuinely translated. Latin brand / tech terms (`Next.js`,
  `TypeScript`, `Storybook`, `LAST KERNEL`, `M4RKYU.SYS`) are intentionally
  kept Latin.

---

## 2 — Deferred to follow-up PRs

### SHOULD-FIX · A11y · Hover lifts fire on touch — **Verified not needed**
- **Files:** `mission-module-card.tsx:56`, `archive-tile.tsx:61`,
  resource-preview-card, others.
- **Finding:** Original concern was that `group-hover:-translate-y-1` and
  `group-hover:scale-[1.02]` would fire on tap-and-hold and stick.
- **Verification:** Tailwind v4's default `hover` behavior already
  wraps `hover:` AND `group-hover:` in `@media (hover: hover)` (see
  [Tailwind docs](https://tailwindcss.com/docs/hover-focus-and-other-states#hover)).
  The project hasn't overridden `--default-hover-behavior`, so touch
  devices never match the hover media query — no sticky-hover possible.
- **Status:** No action needed. The audit finding was Tailwind-v3-era
  thinking; the framework's v4 default handles it.

### SHOULD-FIX · A11y · CommandHero brand mark hidden from AT — **Resolved (decorative)**
- **File:** `src/components/sections/command-hero.tsx`
- **Decision:** Keep `aria-hidden="true"` on the ASCII brand mark. The
  panel's accessible name comes from its `aria-labelledby` linkage to the
  versioned `<h3>` (e.g. "v2027"); when a `status` is supplied, the
  translated `accessibleLabel` on the status link adds the meaningful
  content. The ASCII mark stays atmospheric, not load-bearing.
- **Status:** No code change; logged as a deliberate content call. If
  future user testing shows SR users want a brand readout, expose it via
  a `srOnly` prop on CommandHero.

### SHOULD-FIX · A11y · CommandHero `status.accessibleLabel` English fallback — **Fixed in follow-up**
- **File:** `src/components/sections/command-hero.tsx`
- **Finding:** The fallback `aria-label={status.accessibleLabel ?? \`Open ${status.label}\`}` injected English on /zh when callers omitted `accessibleLabel`.
- **Fix:** Made `accessibleLabel` **required** on `CommandHeroStatus` (alongside a new required `badgeLabel` for the SystemBadge inside the status row). The English fallback is gone. No current call site passes `status`, so the breaking-prop change has no impact today.

### SHOULD-FIX · A11y · Atmospheric layers may reduce muted-foreground contrast
- **Files:** `globals.css:252-266` (`.scanline-layer`, `.noise-layer`,
  `.bg-cyber-grid`)
- **Finding:** `text-muted-foreground` over a scanline + noise + grid
  substrate may fall below WCAG AA 4.5:1 at grid intersection peaks.
- **Why deferred:** Needs measured contrast values at both themes; quick
  visual check isn't enough.
- **Follow-up:** Run an axe pass with the atmospheric layers active; if
  contrast drops below AA, tune `--scanline-opacity` (token already exists)
  from `4%` → `2%` and `--noise-opacity` from `12%` → `8%`.

### NIT · A11y · Reduced-motion early-return for PixelTransitionOverlay
- **File:** `src/components/ui/pixel/pixel-transition-overlay.tsx`
- **Finding:** The global `animation-duration: 1ms !important` override
  collapses the curtain to a 1ms paint under reduced-motion — but it still
  paints a full-screen `bg-background` for that 1ms. Could return `null`
  early for a cleaner reduced-motion experience.
- **Why deferred:** Cosmetic; the 1ms flash is imperceptible. Worth a
  small follow-up if user feedback flags it.

### NIT · A11y · StatusPulse static fallback for reduced-motion
- **File:** `src/components/ui/pixel/status-pulse.tsx`
- **Finding:** Same pattern as PixelTransitionOverlay — relies on the
  global override.
- **Why deferred:** Same rationale; the pulse-halo's final keyframe is
  `opacity: 0`, so the single tick collapses cleanly.

### NIT · A11y · GameHud `<nav>` lacks list semantics
- **File:** `src/components/sections/game-hud.tsx`
- **Finding:** Three toggles + a hint inside a `<nav>` with no list
  wrapping. Screen reader announces them inline.
- **Why deferred:** Functional today; restructuring to
  `<ul role="list">` + `<li>` per toggle or `role="toolbar"` is a
  larger semantic decision.

### NIT · Bilingual · SystemBadge default labels stay English on /zh — **Fixed in follow-up**
- **File:** `src/components/ui/pixel/system-badge.tsx`
- **Finding:** `STATUS_LABEL` and `KIND_LABEL` (Ready / Draft / Pending / Soon / Live / Now / WIP / Archive / Info) rendered English on the ZH route.
- **Fix:** Added a `Status` namespace to `messages/en.json` + `messages/zh.json` covering all four `contentStatusSchema` values + all five `SystemKind` values. The three existing call sites (MissionModuleCard, ProjectCartridge, CommandHero) now load `getTranslations({ namespace: "Status" })` and pass `label={tStatus(status)}` (or `label={tStatus(kind)}`) to SystemBadge. The English defaults inside SystemBadge stay as the fallback for un-translated callers (e.g. future Storybook stories).

### NIT · A11y · SoundToggle tooltip duplicates aria-label
- **File:** `src/components/system/sound-toggle.tsx`
- **Finding:** The Tooltip content string equals the aria-label. Sighted
  users see the same text twice on hover.
- **Why deferred:** Matches the existing ThemeSwitcher + LanguageSwitcher
  pattern. Consistency over polish.

### NIT · Hygiene · BorderBeam saturation guidance
- **Status:** Verified clean. Three production call sites
  (`project-card.tsx`, `mission-module-card.tsx`, `project-cartridge.tsx`)
  + one Storybook story. All gate on `highlighted` / `featured` props,
  and the docs commit to "no more than one beam in view at once" by
  hand-picking the first featured card.

---

## Validation

The audit + remediation pass kept the standard gate green:

- `npm run validate` — silent.
- `npm run build-storybook` — clean.
- `npm run test:e2e` — 96/96 passed across 360 / 390 / 768 / 1280 / 1920
  + Chromium.

Lighthouse + axe are noted as **manual follow-ups** — neither is wired
into CI today, and adding them is its own scope (configure axe-core via
`@axe-core/playwright` + a separate test suite; Lighthouse needs a
hosted preview deploy URL to run against).
