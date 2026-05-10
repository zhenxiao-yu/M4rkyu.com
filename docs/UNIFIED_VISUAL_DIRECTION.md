---
title: M4rkyu.com — Unified Visual Direction
status: draft → living
audience: design + implementation agents (Claude, Codex, human collaborators)
last_updated: 2026-05-10
supersedes_partial: docs/REDESIGN_DIRECTION.md (extends, does not replace — see §0)
companion: docs/AI_WORKFLOW.md, docs/UI_LIBRARY_STRATEGY.md, docs/COMPONENT_MAP.md, docs/GALLERY_SOCIAL_SPEC.md
---

# Unified Visual Direction — "M4RKYU.SYS"

A single planning document that fuses two external references with the existing
M4rkyu.com / LAST KERNEL identity. **No runtime UI changes in this PR.**

---

## 0. How this doc relates to the existing direction

The redesign already has a north star — [REDESIGN_DIRECTION.md](./REDESIGN_DIRECTION.md)
— that explicitly forbids `childish / gamified / sticker-heavy` design and
prescribes a `premium / editorial / quiet-futuristic` voice. **This document
does not overturn that.** It *evolves* it by pulling in:

- **Lambda's** numbered, capability-led layout discipline.
- **Noeinoi's** interaction soul — playful microcopy, scene-change feel,
  cartridge-energy cards.
- The site's **own** existing tokens, atmospheric layers, and Cmd-K palette.

The reconciliation is the 70 / 20 / 10 split in [§2](#2-visual-hierarchy). When
this document and `REDESIGN_DIRECTION.md` disagree on tone, **the older doc
wins on "premium / editorial / restraint"** and this doc wins on "how
interactions feel and how the homepage is composed."

---

## 1. Final design thesis

> **M4RKYU.SYS — a premium cyber-pixel command center.**
> An editorial archive that *boots up* like a developer console: confident,
> bilingual, technically literate, with small moments of game-feel that reward
> attention without ever shouting.

### 1.1 Identity stack

- **Software engineer.** Production-grade hierarchy, numbered sections,
  monospace eyebrows, mission-file project pages.
- **Artist.** Contact-sheet grids, framed compositions, generous whitespace,
  film-grain noise.
- **Game developer.** Cartridge-style project cards, scene-change route
  transitions, optional UI tones, scanline atmosphere — *as accents, not as
  the whole language*.
- **AI-era creative builder.** Tools that ship, posts that earn a read,
  ground-truth metrics only.

### 1.2 What comes from Lambda (the skeleton)

- Confident hero hierarchy: one headline, one subtitle, two CTAs, one
  ambient visual.
- **Numbered capability sections** (`01 · 02 · 03 …`) as the homepage spine.
- Strong section spacing (`py-20` to `py-28`), wide horizontal padding, capped
  content width.
- Engineering-credibility tone: explain *what the systems do*, not *what they
  feel like*.
- Modular content blocks that can be rearranged without redesign.

### 1.3 What comes from Noeinoi (the soul)

- Game-feel hover: hover reveals a `>` glyph or 1–2px outline shift, not a
  glow.
- Scene-change route transitions (dither / pixel mask), 280–800ms.
- Cartridge-style cards with a "spine" / status chip / corner notch.
- Opt-in 8-bit UI sound vocabulary.
- Pixel typography for *labels and HUD only* — never body copy.

### 1.4 What comes from M4rkyu / LAST KERNEL (the atmosphere)

- Existing tokens in [src/app/globals.css](../src/app/globals.css):
  `--background`, `--foreground`, `--card`, `--ring`, `--signal`,
  `--success`, `--warning`, `--surface-ink`, `--surface-paper`, all
  `--motion-*`, `--ease-premium`.
- Existing atmospheric utilities: `.bg-cyber-grid`, `.scanline-layer`,
  `.noise-layer`, `.contact-sheet`, `.archive-vignette`, `.placeholder-noise`.
- Existing single-shot effects: `.glitch-text`, `theme-sweep`.
- Existing primitives in [src/components/ui](../src/components/ui) and the
  Magic UI layer under [src/components/ui/magic](../src/components/ui/magic).
- Bilingual EN / ZH parity via [next-intl](https://next-intl-docs.vercel.app/)
  and [messages/en.json](../messages/en.json) / [messages/zh.json](../messages/zh.json).

### 1.5 What must NOT be copied

- No Lambda assets, exact section copy, GPU/h100 framing, blue-on-black
  enterprise palette, or marketing taglines.
- No Noeinoi character art, mascots, exact pixel-mask shapes, sound files,
  game-screen layouts, or arcade-cabinet framing.
- No fake metrics, fake clients, fake awards (already a hard rule in
  [CLAUDE.md](../CLAUDE.md)).
- No second UI system — additions are wrappers / skins on the existing
  shadcn-on-Radix primitives.
- No fourth font family. Pixel typography is an **addition**, not a
  replacement.

---

## 2. Visual hierarchy

A deliberate ratio keeps the site from drifting into either "corporate SaaS"
or "indie game site."

- **70% premium technical layout** — Syne display + Geist body, mono eyebrows
  (`01 / 05 · capability index`), generous spacing, capped measure, restrained
  color, photographic imagery.
- **20% cyber / system-core atmosphere** — `bg-cyber-grid` substrate,
  `scanline-layer` (sparing), `noise-layer`, `--ring` cyan as the single
  accent, monospace metadata strips, dotted dividers, status pulses.
- **10% playful pixel / game details** — VT323 in HUD chips, labels, and CTAs
  only; cartridge-card spines and notches; dither route transitions; optional
  UI tones; one glitch entrance on the hero headline.

### Why this avoids childish *or* corporate

- Pixel typography stays at chip/label scale (10% slice), so it reads as
  *system glyph*, not as *toy*. It never touches paragraphs.
- The atmospheric layer (20%) is grayscale + one accent — no rainbow gradients,
  no neon overload.
- The premium layer (70%) carries the credibility — numbered sections,
  editorial spacing, real screenshots. A recruiter or client lands on a
  *studio archive*, not a playground.
- The playful 10% lives in *moments* (hover, click, route change) — never in
  the static page weight. Take a screenshot and it still looks editorial.

---

## 3. Homepage architecture

Each section gets a one-line job, a recommended primitive set, and a translation
key prefix it should own in `messages/{en,zh}.json`.

### A. Hero Command Center — `home.hero.*`

**Job:** in one screen, state who Mark is, show what he's building right now,
offer two clear next steps.

- Left column (60% width on desktop): mono eyebrow (`M4RKYU.SYS · v2027`),
  display headline (Syne, `clamp(3rem, 8vw, 7rem)`), 1-line subtitle (Geist
  body L), primary CTA (`Browse the work`), secondary CTA (`Read the logs`).
- Right column (40%): `CommandHero` visual — an atmospheric "terminal /
  project preview" card built on `PixelPanel` + `bg-cyber-grid` + restrained
  Motion. Single live data point if available (latest project status), no fake
  metrics.
- Footer strip: `GameHud` status row — locale switch · theme toggle · sound
  toggle · `>_ press ⌘K` hint.

### B. Numbered Capability System — `home.capabilities.*`

**Job:** show the *range* of what M4rkyu does as five numbered systems, in
Lambda's spine-of-the-page layout.

- Section opener: mono index `05 / capabilities`, display title
  ("Systems & surfaces"), one-line lede.
- Five `NumberedCapability` rows (see [§4.3](#43-numberedcapability)):
  1. **01 · Production Engineering** — shipping Next.js / TypeScript / CI /
     observability work.
  2. **02 · Interface Systems** — design systems, tokens, motion, Storybook,
     a11y.
  3. **03 · Game Feel & Interaction** — LAST KERNEL, prototypes, input
     systems, tuning.
  4. **04 · AI-Assisted Creative Tools** — agent workflows, content
     pipelines, internal tooling.
  5. **05 · Visual Storytelling** — photography, film, art direction,
     gallery curation.

  Each row: index, title, 1–2 sentence description, 2–4 inline tag chips,
  optional small visual.

### C. Featured Mission Modules — `home.featured.*`

**Job:** surface real work as "mission modules." Schema-driven from
[src/content/projects.ts](../src/content/projects.ts) via
[projectSchema](../src/content/schemas.ts).

- 3-card row (4 on `xl`), rendered by `MissionModuleCard` — extends `Card`,
  reads `projectSchema.featured === true`.
- Anchored content slots: cover, status chip (`contentStatusSchema`), title,
  one-line pitch, tag strip, year, category.
- **No hardcoded per-project components.** LAST KERNEL, M4rketview, UI Studio,
  BioLoom, J.D. Power integration work are *content rows in `projects.ts`*,
  not components. Cards are data-rendered.

### D. Creative Archive — `home.archive.*`

**Job:** a contact-sheet preview of the gallery — 4–6 photographs / artworks
in a bento layout, with a `Browse the archive →` link.

- Reuse existing `BentoGrid` from [src/components/ui/magic/bento-grid.tsx](../src/components/ui/magic/bento-grid.tsx).
- Each tile wrapped in `ArchiveTile` (extends current gallery card, adds a
  cartridge-spine treatment).
- Pulls from [src/content/gallery.ts](../src/content/gallery.ts) `featured: true`.

### E. Game Lab — `home.gamelab.*`

**Job:** signal that interactive systems are part of the practice. Schema-
driven from [src/content/games.ts](../src/content/games.ts).

- 2–3 game cards in a `PixelPanel`-framed sub-section labeled `game.lab`.
- Status chip leans on `gameSchema.status` ("in-dev", "shipped", "prototype").
- One pinned title (LAST KERNEL when ready) gets a `BorderBeam` accent — *one
  card max per viewport*, per
  [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md) §5.

### F. Writing / Logs — `home.logs.*`

**Job:** prove this person thinks, not just ships. Latest 3 posts.

- 3-row list, mono date · title · reading time · tag.
- Pulls from existing blog content layer (Phase 11 shipped per
  [git log](../README.md)).
- Section opener uses `SectionFrame` (see [§4.14](#414-sectionframe)) with a
  `>_ logs` glyph in the eyebrow.

### G. Final CTA — `home.contact.*`

**Job:** "open the channel." One sentence + one prominent email link + one
secondary link to /contact.

- `CommandConsole`-skinned panel: VT323 prompt glyph `> contact:`, big email
  link as the headline, support text underneath.
- Mute toggle and reduced-motion respected — no flashing caret if user opts
  out.

---

## 4. Component system

All components are **additive** wrappers / skins on the existing primitives.
None replace `Button`, `Card`, `Badge`, `Dialog`, `Sheet`, `Tabs`, `Tooltip`,
`Command`. New files live in [src/components/ui/pixel/](../src/components/ui/)
(new subfolder, mirroring the existing `magic/`). Every component below
specifies the same eight facets.

> Conventions across every component
> - **Token-only styling.** No raw hex, no arbitrary px values where a
>   `--motion-*` / `--radius-*` / `--color-*` token covers it.
> - **`useReducedMotion()`** from `motion/react` short-circuits all motion.
> - **`aria-hidden="true"`** on every decorative icon / glyph.
> - **Storybook story** at `<file>.stories.tsx` with at least: default,
>   hover, active, disabled, dark theme, zh-locale.
> - **`pointer: fine` guard** on hover-only affordances.

### 4.1 `CommandHero`

- **Purpose:** the right-column hero visual. A `PixelPanel`-framed terminal
  card with a one-line live status ("currently building …"), a sparse
  ASCII-style brand mark, and an ambient `bg-cyber-grid` substrate.
- **Props:** `status?: { label, href? }`, `markGlyph?: ReactNode`,
  `children` (optional inline content).
- **Visual style:** `bg-card`, `border-border`, `rounded-md`, mono labels,
  one `--ring` accent dot.
- **Motion:** mount-only `BlurFade` (existing). `--motion-medium`. No
  loops.
- **Hover/click:** none — it's a display surface; status link is a normal
  `Link`.
- **Mobile:** stacks below the headline; height capped to 28rem; grid
  background switches to a single hairline frame on `< sm`.
- **A11y:** decorative grid hidden from AT; status link has an explicit
  accessible label.
- **Stories:** default · with status · without status · zh-locale ·
  reduced-motion.

### 4.2 `GameHud`

- **Purpose:** the persistent corner HUD strip in the hero (and footer of
  every page). Composes existing toggles — does not duplicate them.
- **Props:** `slots: { locale, theme, sound, hint? }`.
- **Visual style:** 1px `border-border` hairline rule, monospace labels,
  `text-muted-foreground` rest state, `--ring` on focus.
- **Motion:** none. HUD is static text; the toggles inside have their own
  micro-motion already.
- **Hover/click:** delegated to inner toggles.
- **Mobile:** condenses to icon-only on `< sm`; hint chip moves into a
  popover off the menu.
- **A11y:** `<nav aria-label="System status">` wrapper; each slot a
  labelled button.
- **Stories:** default · all toggles open · zh-locale · reduced-motion.

### 4.3 `NumberedCapability`

- **Purpose:** the Lambda-style numbered row. The capability spine of the
  homepage.
- **Props:** `index: string` (e.g. `"01"`), `title: string`, `description: string`,
  `tags?: string[]`, `cta?: { label, href }`, `visual?: ReactNode`.
- **Visual style:** mono `text-2xl` index (in VT323 if available, fallback
  Geist Mono), Syne `text-3xl` title, Geist body description, `gap-10`
  between rows, dotted `PixelDivider` between rows.
- **Motion:** `BlurFade` on first scroll-in, `--motion-medium`.
- **Hover/click:** title acts as link if `cta` is present; underline-from-left
  reveal in `--motion-fast`.
- **Mobile:** index moves above title, visual stacks last.
- **A11y:** index is `aria-hidden`; title link carries the full label.
- **Stories:** default · with CTA · with visual · zh-locale · reduced-motion.

### 4.4 `MissionModuleCard`

- **Purpose:** the cartridge-style featured-project card. Extends `Card`.
- **Props:** `project: Project` (the Zod `projectSchema` type),
  `compact?: boolean`.
- **Visual style:** cartridge "spine" along the top (a 4px bar in
  `bg-muted` with the status chip notched into it), cover image with
  `image-rendering: auto` (photographs stay sharp, not pixelated),
  corner-notch using `clip-path`, `rounded-md`.
- **Motion:** `y: -4` on hover (existing card-lift token from
  [REDESIGN_DIRECTION.md §7](./REDESIGN_DIRECTION.md#7-motion-direction)),
  cartridge spine brightens via `--motion-fast`.
- **Hover/click:** whole card is the link target (`Link` wrapper); focus
  ring uses `ring-ring`.
- **Mobile:** full-width, spine retained, hover replaced by tap-press
  scale `0.99`.
- **A11y:** title is the link text (no "click here"); status chip is a
  `<span role="status">` only when the value is `ready`.
- **Stories:** ready · draft · placeholder · coming-soon · zh-locale ·
  reduced-motion.

### 4.5 `PixelPanel`

- **Purpose:** the generic bordered "system panel" surface — used by
  `CommandHero`, `CommandConsole`, the game-lab subsection, and the final
  CTA.
- **Props:** `title?: string`, `eyebrow?: string`, `tone?: "default" |
  "ink"`, `children`.
- **Visual style:** `bg-card`, 1px `border-border`, optional title bar with
  mono eyebrow on the left and a status dot on the right, `rounded-sm`,
  optional corner notch via `clip-path`.
- **Motion:** none on its own. Children may animate.
- **Hover/click:** none — it's a surface.
- **Mobile:** title bar wraps; corner notch hidden below `sm` to avoid
  awkward clipping.
- **A11y:** `<section aria-labelledby>` when a title is provided.
- **Stories:** default · with title · ink tone · with corner notch ·
  zh-locale.

### 4.6 `PixelButton`

- **Purpose:** a *skin*, not a new variant set. Wraps the existing `Button`
  ([src/components/ui/button.tsx](../src/components/ui/button.tsx)) and adds
  optional leading `>` caret glyph + optional UI-sound hook. Inherits the
  locked variants `default | secondary | outline | ghost | link` (no
  `destructive`).
- **Props:** the existing `Button` props + `glyph?: "caret" | "play" |
  "send"`, `sound?: "click" | "confirm"`.
- **Visual style:** glyph uses VT323; sits 1ch before the label, opacity
  `0.6` rest, `1` on hover.
- **Motion:** `scale: 0.98` press, `--motion-micro`. Glyph slides in `2px`
  on hover, `--motion-fast`.
- **Hover/click:** caret slide-in on hover (pointer-fine only); on click,
  fires sound *only* if `SoundToggle` is `on` AND `prefers-reduced-motion`
  is `no-preference`.
- **Mobile:** glyph stays static (no hover slide); press uses haptic-style
  scale.
- **A11y:** glyph is `aria-hidden`; sound is never the sole feedback.
- **Stories:** every base variant × every glyph option · disabled ·
  zh-locale · reduced-motion · sound off / sound on.

### 4.7 `SystemBadge`

- **Purpose:** the status chip that drives `MissionModuleCard`,
  `ProjectCartridge`, archive tiles, etc. Wraps `Badge` (
  [src/components/ui/badge.tsx](../src/components/ui/badge.tsx)).
- **Props:** `status: ContentStatus` (from `contentStatusSchema`) **or**
  `kind: "live" | "now" | "wip" | "archive" | "info"`, `label?: string`.
- **Visual style:** small VT323 label (uppercase), 6px dot in
  `--success` / `--warning` / `--signal` / `--muted-foreground`, hairline
  `border-border`.
- **Motion:** `live` and `now` pulse the dot via `StatusPulse`
  ([§4.13](#413-statuspulse)). Everything else is static.
- **Hover/click:** none unless wrapped in a link.
- **Mobile:** unchanged.
- **A11y:** decorative dot is `aria-hidden`; live/now states use
  `<span role="status" aria-live="polite">`.
- **Stories:** one per `ContentStatus` value · live · zh-locale ·
  reduced-motion.

### 4.8 `CommandConsole`

- **Purpose:** the **skin** applied on top of the existing `Command` palette
  ([src/components/ui/command.tsx](../src/components/ui/command.tsx)).
  Behavioral parity with cmdk. Used by the Cmd-K palette and by the final
  CTA section.
- **Props:** `prompt?: string` (default `">"`), `scanlines?: boolean`,
  `caret?: boolean`, `children`.
- **Visual style:** `bg-popover`, VT323 prompt glyph + label, optional
  `.scanline-layer` overlay, optional blinking caret.
- **Motion:** caret blink at `--motion-medium` cadence, only when
  `prefers-reduced-motion: no-preference`.
- **Hover/click:** delegated to cmdk.
- **Mobile:** scanlines disabled below `sm` for perf; prompt remains.
- **A11y:** the palette retains all existing cmdk keyboard and ARIA
  behavior. Scanlines are decorative-only.
- **Stories:** Cmd-K palette skin · CTA panel skin · without scanlines ·
  zh-locale · reduced-motion.

### 4.9 `PixelTransitionOverlay`

- **Purpose:** the dither / pixel-mask scene-change wipe used on Dialog,
  Sheet, and App Router `loading.tsx` boundaries.
- **Props:** `mode: "dither" | "wipe-l" | "wipe-r"`, `duration?: "medium" |
  "slow" | "cinematic"`, `onDone?: () => void`.
- **Visual style:** a fixed-position overlay using a CSS mask of stepped
  squares (no canvas), rendered in `var(--background)`.
- **Motion:** `Motion` with `steps(N, end)` easing for the stepped look,
  using `--motion-medium` to `--motion-cinematic`. On
  `prefers-reduced-motion`, falls back to a 180ms cross-fade.
- **Hover/click:** none — it's a transition layer.
- **Mobile:** smaller step count (perf), shorter duration
  (`--motion-medium`).
- **A11y:** `aria-hidden`, `pointer-events: none`; never traps focus.
- **Stories:** dither · wipe-l · wipe-r · reduced-motion · mobile-step.

### 4.10 `SoundToggle`

- **Purpose:** the single source of truth for "is UI sound on?". Visible in
  `GameHud`.
- **Props:** none (reads/writes `localStorage["m4rkyu.sound"]`).
- **Visual style:** small icon button (Lucide `volume-2` / `volume-x`),
  mono label "SND" on the side.
- **Motion:** scale `0.98` press only.
- **Hover/click:** click toggles state; emits one confirm tone *only when
  switching from off → on* (so the user hears what they enabled).
- **Mobile:** unchanged; remains in the HUD.
- **A11y:** `aria-pressed`, `aria-label="Toggle UI sound"`.
- **Stories:** off (default) · on · disabled (reduced-motion) · zh-locale.

### 4.11 `ProjectCartridge`

- **Purpose:** the larger detail-page header card, used at the top of
  `/projects/[slug]` and `/games/[slug]`. Sibling of `MissionModuleCard`
  (which is the homepage tile) — *not* a duplicate.
- **Props:** `project: Project | Game`, `actions?: ReactNode`.
- **Visual style:** wider spine, cartridge label (engine / category /
  year), inset `PixelPanel`, optional `BorderBeam` for the featured /
  pinned title.
- **Motion:** mount-only `BlurFade`, no hover (it's the page header).
- **Hover/click:** action buttons inside have their own behavior.
- **Mobile:** spine wraps below the title; actions move into a horizontal
  scroll strip on `< sm`.
- **A11y:** acts as the page `<header>`; cartridge label inside an
  `<aside>` for context.
- **Stories:** project (web app) · project (game) · without cover ·
  pinned · zh-locale.

### 4.12 `ArchiveTile`

- **Purpose:** the gallery / contact-sheet tile used in the Creative
  Archive homepage section and on `/gallery`.
- **Props:** `item: GalleryItem`, `aspect?: "1/1" | "3/2" | "4/5" | "16/9"`.
- **Visual style:** `bg-cyber-grid` background while the image is loading;
  thin hairline frame; subtle spine chip with the collection slug.
- **Motion:** `BlurFade` on first reveal; on hover (pointer-fine only),
  image desaturates → color in `--motion-medium`.
- **Hover/click:** opens the existing gallery lightbox.
- **Mobile:** hover replaced by tap-press scale `0.99`; desaturation
  disabled.
- **A11y:** `alt` text from `galleryItemSchema.caption`; lightbox open is
  the existing accessible Dialog.
- **Stories:** each aspect ratio · with caption · loading · zh-locale ·
  reduced-motion.

### 4.13 `StatusPulse`

- **Purpose:** the small live / now indicator. Used inside `SystemBadge`,
  the hero status link, and the writing strip.
- **Props:** `tone: "live" | "now" | "info"`, `size?: "sm" | "md"`.
- **Visual style:** filled dot (`--signal` / `--success` /
  `--muted-foreground`) with a 0–1 opacity halo ring.
- **Motion:** halo pulses at `--motion-slow` to `--motion-cinematic`,
  single keyframe, `infinite` only when *not* reduced-motion.
- **Hover/click:** none.
- **Mobile:** unchanged.
- **A11y:** decorative — *never* the sole conveyor of state.
- **Stories:** each tone · sm · md · reduced-motion.

### 4.14 `SectionFrame`

- **Purpose:** the shared section opener — mono index, display title,
  optional lede, optional `>_ glyph` eyebrow. Replaces ad-hoc section
  headers across the homepage.
- **Props:** `index?: string`, `eyebrow?: string`, `title: string`,
  `lede?: string`, `actions?: ReactNode`, `frame?: "default" | "panel"`.
- **Visual style:** mono index (Geist Mono or VT323) → Syne display title
  → Geist body lede → optional inline actions on the right.
- **Motion:** `BlurFade` on first scroll-in.
- **Hover/click:** actions only.
- **Mobile:** index and eyebrow merge into a single mono line; actions
  wrap below.
- **A11y:** uses `<header>` semantic with `<h2>` for the title.
- **Stories:** default · with actions · panel frame · zh-locale ·
  reduced-motion.

---

## 5. Token system

### 5.1 Reuse first

Every existing token in [src/app/globals.css](../src/app/globals.css) is the
source of truth — see the inventory below. No new file is required to consume
them; Tailwind v4's `@theme inline` already maps the variables into utility
classes like `bg-card`, `border-border`, `text-ring`.

**Existing color tokens:** `--background`, `--foreground`, `--card`,
`--card-foreground`, `--popover`, `--popover-foreground`, `--primary`,
`--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`,
`--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`,
`--border`, `--input`, `--ring`, `--surface-ink`, `--surface-paper`,
`--signal`, `--success`, `--warning`.

**Existing radius tokens:** `--radius`, `--radius-sm`, `--radius-md`,
`--radius-lg`, `--radius-xl`.

**Existing motion tokens:** `--motion-micro` (120), `--motion-fast` (180),
`--motion-medium` (280), `--motion-slow` (500), `--motion-cinematic` (800),
`--ease-premium`.

**Existing font tokens:** `--font-sans` (Geist), `--font-mono` (Geist Mono),
`--font-display` (Syne).

### 5.2 Proposed new semantic tokens (added in Phase 1, not now)

Each new token is added inside the existing `@theme inline { … }` block in
[globals.css](../src/app/globals.css) — no `tailwind.config.*` file (the
project is Tailwind v4, CSS-first).

| Token | Default | Purpose |
| --- | --- | --- |
| `--font-pixel` | `VT323` via `next/font/google` | Pixel display for HUD chips, CTAs, indices, eyebrows. **Never** body, **never** CJK. |
| `--pixel-border` | `1px` | Standard pixel-UI hairline width. Replaces inline `border-width: 1px` in pixel components. |
| `--pixel-grid-unit` | `4px` | Snap unit for pixel-spacing math; ladders into Tailwind's `gap-1` (4) / `gap-2` (8). |
| `--hud-muted` | `color-mix(in srgb, var(--foreground) 60%, transparent)` | HUD label rest color — slightly stronger than `--muted-foreground`. |
| `--terminal-glow` | `color-mix(in srgb, var(--ring) 28%, transparent)` | Soft glow under the hero terminal heading / caret. **One** site-wide use site. |
| `--mission-surface` | `var(--card)` (light) / `var(--card)` (dark) | Semantic alias for `MissionModuleCard` / `ProjectCartridge` background. Lets us re-skin cartridges without touching every component. |
| `--scanline-opacity` | `4%` | Promote the currently-inline `.scanline-layer` opacity to a token. |
| `--noise-opacity` | `12%` | Promote the `.noise-layer` blob opacity to a token. |
| `--panel-depth` | `0 1px 0 color-mix(in srgb, var(--foreground) 8%, transparent)` | The single shared "pixel panel" shadow. Replaces `shadow-md` on `PixelPanel`. |
| `--game-accent` | `var(--ring)` | Semantic alias so the playful 10% can be retuned later without touching `--ring` everywhere. Currently identical to `--ring`. |
| `--ease-pixel-step` | `steps(6, end)` | The stepped easing used by `PixelTransitionOverlay` and the `.glitch-text` keyframes already in CSS. |

### 5.3 Hard bans (already in [AI_WORKFLOW.md](./AI_WORKFLOW.md))

- No `bg-zinc-*`, no `bg-[#hex]`, no `text-[#hex]`.
- No `transition-[colors,transform]` (Tailwind v4 invalid).
- No new shadow / radius family. Use `shadow-sm | shadow-md | shadow-lg` and
  the `--radius-*` family only.
- No second accent color in production routes. `--ring` (with `--game-accent`
  as its semantic alias) is the only accent.

---

## 6. Typography system

A four-family stack: Syne (display), Geist (body / UI), Geist Mono (mono),
VT323 (pixel) — *added*, not replacing. No fifth font is allowed.

| Family | Token | Allowed | Forbidden |
| --- | --- | --- | --- |
| **Syne** | `--font-display` | `h1`, `h2`, hero, page headers, section titles. | Body, captions, eyebrows. |
| **Geist** | `--font-sans` | Body paragraphs, card text, navigation, descriptions, form controls. | Hero display, pixel HUD. |
| **Geist Mono** | `--font-mono` | Indices (`01 / 05`), eyebrows, captions, kbd, code, system metadata. | Body paragraphs. |
| **VT323** | `--font-pixel` (new) | HUD chips, CTA glyphs, status badges, small ASCII brand marks, optional hero accent. **English only.** | Body paragraphs of any length. Any CJK headline or label. |

### 6.1 CJK rules

- `:lang(zh)` overrides any `font-family: var(--font-pixel)` declaration back
  to `var(--font-display)` (Syne) for headlines and `var(--font-sans)` for
  body. Honors
  [REDESIGN_DIRECTION.md §4](./REDESIGN_DIRECTION.md#4-typography-direction):
  rely on the system Chinese stack (`Source Han`, `PingFang`, `Microsoft
  YaHei`) via the existing fallback chain. No web CJK font installed.
- VT323 is never applied to `:lang(zh)` — Phase 1 will ship a CSS guard that
  enforces this automatically.
- ZH headlines stay on Syne (which renders Latin) → falls through to system
  CJK; line-height bumps to `1.55` on `:lang(zh)` for readability.

### 6.2 Pixel typography allowed surfaces

- HUD chips (`GameHud`, `SystemBadge`).
- CTA glyphs and labels on `PixelButton`.
- `SectionFrame` `index` only (the `01 / 05` glyph), at 18px+.
- One-shot hero accent line (e.g. `> M4RKYU.SYS`) — **one** site-wide.
- `CommandConsole` prompt glyph.

### 6.3 Pixel typography forbidden surfaces

- Any paragraph of body text.
- All headlines on the ZH route.
- Form labels, error messages, alt text, captions over ~14px.
- The blog post body.

---

## 7. Motion system

### 7.1 Engine and rules

- **Engine:** `motion/react` (the `motion` package, v12.38, already a dep).
- **No GSAP, no Three.js, no WebGL** in Phase 1 (or 2). Reassess only if a
  specific scroll-timeline or 3D need can't be solved with `motion/react`
  *and* satisfies the [perf budget](#8-performance) in
  [REDESIGN_DIRECTION.md §13](./REDESIGN_DIRECTION.md#13-risks-to-watch).
- **`prefers-reduced-motion`:** every animated primitive uses
  `useReducedMotion()` from `motion/react`. When true: no infinite
  loops, no scale on press, no transition wipes — just opacity cross-fade
  ≤180ms.
- **Pointer-coarse short-circuit:** every hover affordance is gated on
  `matchMedia("(pointer: fine)").matches`. Touch surfaces get no hover-only
  signal.
- **Hardcoded easings** inside `motion/react` props get the carve-out comment
  required by [AI_WORKFLOW.md §2](./AI_WORKFLOW.md#2-the-cross-cutting-rules).

### 7.2 Interaction grammar

| Interaction | Feel | Duration / Easing |
| --- | --- | --- |
| Hover (menu-select) | `>` caret slides in, 1–2px outline shift, no glow. | `--motion-fast` · `--ease-premium`. |
| Click / press | `scale: 0.98`, optional UI tone (opt-in). | `--motion-micro` · `--ease-premium`. |
| Route change | Pixel-mask dither wipe via `PixelTransitionOverlay`. | `--motion-medium` to `--motion-cinematic` · `--ease-pixel-step`. |
| Modal / Sheet open | Cross-fade + 4px lift (existing). | `--motion-medium` · `--ease-premium`. |
| Card hover (cartridge) | `y: -4`, spine brightens — *no scale, no rotate, no 3D tilt*. | `--motion-medium` · `--ease-premium`. |
| Theme switch | Keep existing `theme-sweep` circle reveal. | 520ms · existing curve. |
| Hero title entrance | Keep existing `.glitch-text` one-shot. | 320ms · steps(6). |
| Status pulse | Halo opacity 0 → 1 → 0. | `--motion-slow` · linear loop, *only* on `live` / `now`. |

### 7.3 Banned

Inherited from [REDESIGN_DIRECTION.md §7](./REDESIGN_DIRECTION.md#7-motion-direction):

- Parallax > 24px.
- Continuous looping animations outside the hero marquee + live `StatusPulse`.
- Scroll-jacked sections.
- 3D card tilts on hover.
- Sparkle / particle systems on body content.
- Any user-initiated animation longer than 800ms.

---

## 8. Sound system

The site is **silent by default**. Sound is an opt-in *enhancement layer*.

- **No autoplay.** Ever. The first sound the user hears is the confirm tone
  the moment they enable `SoundToggle`.
- **Visible mute toggle.** `SoundToggle` lives in `GameHud` in every page
  layout. Always discoverable.
- **Generation, not files.** UI tones are generated procedurally via the
  browser-native Web Audio API — short square / triangle waves, 50–150ms,
  pitched in a small palette (click, confirm, scene-enter, error). **No new
  dependency** is added.
- **Cue vocabulary (Phase 7):**
  - `click` — `PixelButton` press (60ms square, 880Hz → 660Hz).
  - `confirm` — primary CTA, palette open (120ms triangle, 660Hz → 880Hz).
  - `scene-enter` — route transition (160ms, two pitched square clicks).
  - `error` — form rejection (90ms low square, 220Hz).
- **Mobile:** sound is disabled by default and the toggle is hidden behind a
  long-press / settings sheet to avoid surprise; user can still enable it.
- **A11y:**
  - Every sound has a visual analog (scale, flash, caret).
  - Sound is never the sole conveyor of state.
  - `prefers-reduced-motion` (used as a proxy for "no surprise feedback")
    forces sound off unless explicitly re-enabled.
  - Stored preference key: `localStorage["m4rkyu.sound"]` — `"on"` /
    `"off"` (default `"off"`).
- **Volume:** all generated tones clamp ≤ -18 LUFS-equivalent. No user
  volume slider in Phase 7; revisit if requested.

---

## 9. Responsiveness

Viewport matrix (already enforced by [playwright.config.ts](../playwright.config.ts)):
**360 / 390 / 768 / 1280 / 1920**.

### 9.1 Per-breakpoint layout intent

| Breakpoint | Hero | Capabilities | Cards | HUD |
| --- | --- | --- | --- | --- |
| `≥ 1280px` (desktop) | 60 / 40 split, `CommandHero` on the right, full HUD strip. | 5 rows full width, index on the left. | 3-up `MissionModuleCard` (4-up at `xl`). | Full HUD inline in hero footer. |
| `768 – 1279px` (tablet) | Stacked: headline → `CommandHero` below. | Same 5 rows, slightly tighter. | 2-up cards. | HUD condenses; sound toggle icon-only. |
| `390 – 767px` (mobile) | Single column, headline → subtitle → CTAs → `CommandHero` (compact). | Index moves above title; visuals stack last. | 1-up cards, full-width. | HUD becomes a 3-icon strip (locale / theme / sound). |
| `360px` (smallest) | Same as 390 but with `text-balance` enforced and CTAs stacked vertically. | Same. | 1-up; spine simplified. | HUD becomes a single overflow button → bottom sheet. |

### 9.2 Navigation behavior

- Header nav: 5 links + Cmd-K trigger + locale + theme on `≥ 768px`; collapses
  to a `Sheet` drawer on `< 768px`. (Already shipped.)
- Footer is the same on every viewport; CTA section stacks vertically on
  `< 768px`.

### 9.3 Project-card behavior

- `MissionModuleCard` is the same component at every viewport; hover effects
  short-circuit on `(pointer: coarse)`.
- Cartridge spine is always visible (it's the brand signature).
- Status chip stays in the top-right at all viewports.

### 9.4 CTA priority

- Hero ships **two** CTAs at every viewport. Below `390px` they stack
  vertically; otherwise inline.
- Closing CTA section ships **one** primary (email link) + **one** secondary
  (`/contact`).
- Mobile-specific: the bottom-of-page floating CTA used elsewhere in the site
  is *not* added by this redesign.

### 9.5 Reduced effects on small screens

- `bg-cyber-grid` background size scales from `56px` to `32px` below `sm`.
- `scanline-layer` is **off** below `sm` (perf).
- `PixelTransitionOverlay` step count drops from `8` to `4` below `md`.
- `Particles` (if used anywhere) cap `quantity` ≤ 20 on `< md`, off on
  `< sm` (already a rule in [UI_LIBRARY_STRATEGY.md §11](./UI_LIBRARY_STRATEGY.md#11-performance-guardrails)).

### 9.6 Bilingual text wrapping

- All hero, headline, and section copy uses `text-balance` (already styled).
- ZH route: line-height `1.55` on `<h1>`–`<h3>`, letter-spacing reset to
  `normal` (no Latin tracking).
- Long EN hero titles cap at `max-w-[18ch]` on display sizes; ZH equivalents
  cap at `max-w-[14em]`.
- CTA buttons use `min-w-[10rem]` to keep both EN and ZH labels on one line.

---

## 10. Content strategy

### 10.1 Positioning

Mark Yu is **one person building across software, games, art, and tools** —
positioned as an engineer who ships interfaces, a game developer who reasons
about feel, an artist who curates frames, and an AI-era builder who treats
agents as a craft. Avoid the words *passionate*, *innovative*, *cutting-edge*,
*revolutionary*, *10×*, *seamless*, *world-class*, *empower*, *unleash*.

### 10.2 Hero headline options (English)

Pick one. Each is ≤ 6 words, fits `clamp(3rem, 8vw, 7rem)` Syne, and reads
well in both light and dark themes.

1. `Systems, games, and quiet frames.`
2. `One archive. Software, art, games.`
3. `Engineering interfaces with game-developer instincts.`
4. `An archive maintained by one person.`
5. `Built like software. Curated like a magazine.`

### 10.3 Hero subtitle options (English)

Pick one. ≤ 24 words, Geist body L.

1. `I ship production interfaces, prototype interactive systems, and curate a small archive of photographs and writing — all from one workshop.`
2. `Software engineer, game developer, and visual archivist. This site collects the work, the logs, and a small set of tools that earn their keep.`
3. `A working archive of interfaces, game prototypes, photography, and field notes — written and shipped by one person.`
4. `One operator, four surfaces: production code, game prototypes, gallery, and writing — held together by a small set of tools.`
5. `Engineering credibility, art-school taste, and a quiet preference for systems you can read end-to-end.`

### 10.4 Hero subtitle options (Simplified Chinese)

Pick one. Matches the English subtitle of the same number; not a literal
translation — written for CJK rhythm.

1. `生产级界面、互动原型、影像与文字 —— 一个人维护的工作档案。`
2. `软件工程师，游戏开发者，视觉记录者。这里收录作品、日志，以及为自己写的小工具。`
3. `一个由一个人维护的档案：界面、游戏原型、影像与笔记。`
4. `一名操作者，四种表面：生产代码、游戏原型、影像与写作 —— 由一套小工具串联。`
5. `工程的严谨，艺术的审美，倾向于可以从头读到尾的系统。`

### 10.5 CTA labels

| Slot | English | Simplified Chinese |
| --- | --- | --- |
| Hero primary | `Browse the work` | `浏览作品` |
| Hero secondary | `Read the logs` | `阅读日志` |
| Final primary | `Open a channel →` | `开启对话 →` |
| Final secondary | `View résumé` | `查看履历` |
| Cmd-K hint | `>_ press ⌘K` | `>_ 按 ⌘K` |

### 10.6 Section labels (EN / ZH)

Live keys go under `home.*` in [messages/en.json](../messages/en.json) and
[messages/zh.json](../messages/zh.json) — translations are hand-written, never
machine-transliterated.

| Slot | English | Simplified Chinese |
| --- | --- | --- |
| `home.hero.eyebrow` | `M4RKYU.SYS · v2027` | `M4RKYU.SYS · v2027` |
| `home.capabilities.eyebrow` | `05 / capabilities` | `05 / 能力` |
| `home.capabilities.title` | `Systems & surfaces` | `系统与界面` |
| `home.capabilities.01.title` | `Production engineering` | `生产工程` |
| `home.capabilities.02.title` | `Interface systems` | `界面系统` |
| `home.capabilities.03.title` | `Game feel & interaction` | `游戏感与交互` |
| `home.capabilities.04.title` | `AI-assisted creative tools` | `AI 辅助创作工具` |
| `home.capabilities.05.title` | `Visual storytelling` | `视觉叙事` |
| `home.featured.eyebrow` | `selected · missions` | `精选 · 任务` |
| `home.featured.title` | `Featured mission modules` | `精选任务模组` |
| `home.archive.eyebrow` | `creative · archive` | `视觉 · 档案` |
| `home.archive.title` | `Frames from the workshop` | `工作间一隅` |
| `home.gamelab.eyebrow` | `game · lab` | `游戏实验室` |
| `home.gamelab.title` | `Interactive systems in flight` | `进行中的互动系统` |
| `home.logs.eyebrow` | `writing · logs` | `写作 · 日志` |
| `home.logs.title` | `Field notes` | `现场笔记` |
| `home.contact.eyebrow` | `> contact` | `> 联系` |
| `home.contact.title` | `Open the channel` | `开启对话` |

### 10.7 What to avoid

Pulled forward from [REDESIGN_DIRECTION.md §10](./REDESIGN_DIRECTION.md#10-what-the-site-must-avoid):
- "Passionate developer" / "10× engineer" wording.
- Fake metrics (users, downloads, awards, response SLAs).
- Overhyped AI ("revolutionizing", "redefining", "AI-first").
- SaaS marketing clichés ("ship faster", "build the future").
- Childish or sticker-heavy game language ("Let's play!", "high score!",
  achievements UI for non-game pages).

---

## 11. Implementation phases

Eight phases. One PR per phase. Each PR is independently shippable and stays
green on the validation gate in [§12](#12-acceptance-criteria).

### Phase 0 — `chore(direction): unify visual direction doc` *(this PR)*

Add this file. No code changes.

### Phase 1 — `feat(pixel): tokens + foundation`

- Wire `VT323` via `next/font/google` in [src/app/layout.tsx](../src/app/layout.tsx),
  expose as `--font-pixel`.
- Add the new semantic tokens from [§5.2](#52-proposed-new-semantic-tokens-added-in-phase-1-not-now)
  inside the existing `@theme inline { … }` block in
  [src/app/globals.css](../src/app/globals.css).
- Add the `:lang(zh)` guard that rejects `var(--font-pixel)` on the ZH route.
- No component or page changes.

### Phase 2 — `feat(pixel): primitive components`

- Build the four foundational primitives only:
  `PixelPanel`, `PixelButton`, `SystemBadge`, `SectionFrame`. New folder
  `src/components/ui/pixel/`.
- Each gets a Storybook story (per [§4](#4-component-system) facets).
- No page changes yet.

### Phase 3 — `feat(home): CommandHero + GameHud`

- Rebuild the homepage hero using `CommandHero` + `GameHud` + new headline /
  subtitle from [§10](#10-content-strategy).
- Update [messages/en.json](../messages/en.json) and
  [messages/zh.json](../messages/zh.json) with the new keys (translations from
  line one).
- Keep the rest of the homepage untouched.

### Phase 4 — `feat(home): numbered capability section`

- Add `NumberedCapability` and ship the 5-row capability section using
  `SectionFrame` + the five content entries.
- Visuals are optional in Phase 4 — text-only rows are fine.

### Phase 5 — `feat(projects): mission-module + cartridge`

- Add `MissionModuleCard` (homepage tile) and `ProjectCartridge`
  (detail-page header).
- Migrate the homepage featured projects row and `/projects/[slug]` header to
  the new primitives. Schema-driven from
  [src/content/projects.ts](../src/content/projects.ts).
- Add `ArchiveTile` for the homepage Creative Archive section.

### Phase 6 — `feat(motion): pixel transitions + microinteractions`

- Add `PixelTransitionOverlay` and wire it into Dialog / Sheet open and into
  the App Router `loading.tsx` for `/projects` and `/gallery`.
- Add `StatusPulse` and use it inside `SystemBadge` and the hero status link.
- Sweep existing components to use the new microinteraction grammar from
  [§7.2](#72-interaction-grammar).

### Phase 7 — `feat(audio): SoundToggle + UI sounds`

- Add `SoundToggle` to `GameHud`.
- Implement the 4-cue Web Audio module (click, confirm, scene-enter, error).
- Wire `PixelButton`'s `sound` prop. Disabled by default. Reduced-motion
  forces off.

### Phase 8 — `chore(qa): mobile + a11y + perf + bilingual audit`

- Playwright viewport matrix sweep at 360 / 390 / 768 / 1280 / 1920.
- Lighthouse run (mobile target: Performance ≥ 90, A11y ≥ 95).
- axe audit (no new violations).
- ZH-route parity check (every new key translated, line-height correct, no
  pixel font leaking onto CJK).

---

## 12. Acceptance criteria

### 12.1 Validation gate (every phase)

Every PR must pass before merge:

```powershell
npm run lint
npm run typecheck
npm run validate       # = lint + typecheck
npm run build          # CI on Linux is the source of truth — local Windows hits the EISDIR issue (see AI_WORKFLOW.md §3)
npm run build-storybook
npm run test:e2e
```

### 12.2 Qualitative checks

After Phase 8, read the following list aloud. If any line is false, the
redesign isn't done:

- The site feels **premium** — generous spacing, confident type, no template
  tells.
- The site feels **technical** — numbered systems, monospace metadata,
  real screenshots.
- The site feels **playful** — small game-feel moments at hover / click /
  route change, never on the static page.
- The site feels **cyber** — `bg-cyber-grid`, `scanline-layer`, a single cyan
  accent.
- The site stays **readable** — body text is Geist at 1rem/1.65, line-length
  capped at ~70ch.
- The site is **bilingual** — every visible string has an EN and ZH form,
  Chinese is hand-written, no pixel font leaks onto CJK.
- The site feels **personal** — one person's archive, edited carefully.
- The site is **not copied** — no Lambda assets, no Noeinoi assets, no
  upstream component shipped untokenized.
- The site is **not generic** — Syne display, one accent, mono eyebrows,
  cartridge cards.
- The site is **not childish** — pixel typography stays at chip / label
  scale, no stickers, no confetti, no rainbow buttons.
- The site is **not corporate boring** — small `>` carets, the optional
  `confirm` tone, the dither route wipe, the LAST KERNEL portal Easter egg.

---

## 13. Out of scope for this PR

- No edits under `src/`, `messages/`, `package.json`, `next.config.ts`,
  `tsconfig.json`.
- No new npm dependencies.
- No font installation (VT323 is *prescribed* here, *installed* in Phase 1).
- No `tailwind.config.*` file (Tailwind v4 is CSS-first).
- No actual `Pixel*` / `Mission*` / `Game*` component code — all components
  are *specified* here, *implemented* in Phases 1–7.

---

## 14. Recommended next PR

**Phase 1 — `feat(pixel): tokens + foundation`.**

1. Add `VT323` via `next/font/google` in [src/app/layout.tsx](../src/app/layout.tsx),
   expose CSS variable as `--font-pixel`.
2. Inside the existing `@theme inline { … }` block in
   [src/app/globals.css](../src/app/globals.css), add the ten new semantic
   tokens from [§5.2](#52-proposed-new-semantic-tokens-added-in-phase-1-not-now).
3. Add the `:lang(zh)` CSS guard that prevents `var(--font-pixel)` from
   applying on the ZH route.
4. Add one short paragraph to
   [docs/AI_WORKFLOW.md §2](./AI_WORKFLOW.md#2-the-cross-cutting-rules)
   adding the new token + font conventions to the cross-cutting rules.
5. **No component changes, no page changes.**

Validation: `npm run validate && npm run build-storybook && npm run test:e2e`.
All must be silent / green. PR scope: ~4 files touched, ~60 lines net added.
