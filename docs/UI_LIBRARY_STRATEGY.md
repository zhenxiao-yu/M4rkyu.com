---
title: M4rkyu.com — UI Library Strategy
status: planning
audience: implementation agents (Claude, Codex), reviewers
last_updated: 2026-05-07
---

# UI Library Strategy

This document defines **which UI sources** the redesign is allowed to draw
from, **what each one is for**, and **how to keep the site from looking like
any of them**. It is opinionated. Future agents should not introduce a new UI
source without first arguing why none of the four below covers the gap.

---

## 1. Recommended UI Stack

The redesign uses a **layered** approach — each layer has a clear job, and
nothing on a higher layer is allowed to leak into a lower one.

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4 — Project polish                               │
│   src/app/globals.css tokens, brand glue, page shells   │
├─────────────────────────────────────────────────────────┤
│  Layer 3 — Hero / atmosphere (selective)                │
│   Aceternity UI — copy-in, used 1–3 times site-wide     │
├─────────────────────────────────────────────────────────┤
│  Layer 2 — Premium / social pieces                      │
│   Magic UI · Origin UI · 21st.dev — copy-in patterns    │
├─────────────────────────────────────────────────────────┤
│  Layer 1 — Accessible primitives (the foundation)       │
│   shadcn/ui on Radix — already owned in src/components  │
└─────────────────────────────────────────────────────────┘
```

The site already lives at Layer 1 (shadcn-style primitives + Radix). Phase 1
of the redesign builds Layer 2 and a _very small_ amount of Layer 3.

---

## 2. The Four Sources

### 2.1 shadcn/ui — base accessible primitives

**Status:** already in use. `src/components/ui/*` follows shadcn's pattern —
local source, owned, themeable via the existing CSS variables.

**Use it for:**

- `Button`, `Card`, `Dialog`, `Sheet`, `Tabs`, `Tooltip`, `Badge`, `Input`,
  `Select` — already present, keep.
- New primitives the redesign needs: `Avatar`, `Separator`, `ScrollArea`,
  `Popover`, `DropdownMenu`, `HoverCard`, `Toggle`, `ToggleGroup`,
  `Breadcrumb`, `Pagination`, `Skeleton`, `Sonner` (toast),
  `Command` (palette), `Form` + `Label`, `Textarea`, `Checkbox`,
  `RadioGroup`, `Slider`, `Carousel` (Embla under shadcn API).
- Anything that needs accessible focus management, keyboard handling, or
  portal behavior.

**Do not use it for:**

- Marketing surfaces. Shadcn is intentionally austere — wrap it before it
  hits the page.
- "Decorative" components. Anything that exists for vibes lives in Magic UI.

**Ownership rule:** every shadcn component is **copied into our repo** under
`src/components/ui` and modified to consume our tokens. We never depend on a
runtime `shadcn-ui` package. `npx shadcn@latest add <component>` is fine for
scaffolding but the output gets committed and edited.

---

### 2.2 Magic UI — premium / motion components

**Status:** not yet installed. This is the most-leaned-on Layer 2 source.
Magic UI is published as copy-in TSX (same model as shadcn), with motion
hooks. Most components depend on `motion/react` (already a dep), `clsx`
(present), and Tailwind (present).

**Use it for:**

- **Hero atmosphere:** `AnimatedGridPattern`, `BlurFade`, `BorderBeam`,
  `Particles` (with `quantity` clamped low).
- **Layout patterns:** `BentoGrid`, `Marquee` (we already have a custom
  marquee — replace ours with Magic UI's only if it's a clear upgrade).
- **Affordances / CTAs:** `ShimmerButton`, `RainbowButton` _(banned, see
  §6)_, `InteractiveHoverButton`.
- **Numbers / counters:** `NumberTicker` — only with real values.
- **Text effects:** `WordRotate`, `TextReveal`, `AnimatedGradientText`
  (banned for body copy, allowed once in hero).
- **Cards:** `MagicCard`, `NeonGradientCard` (banned), `OrbitingCircles`
  (allowed once if it visualizes something real).
- **Beam connectors:** `AnimatedBeam` between the hero subjects ("engineer →
  artist → designer").

**Do not use it for:**

- Buttons in dense UIs (forms, dialogs, archive grids).
- Body cards in archives (`ProjectCard`, `ArchiveCard`).
- Anywhere the Aceternity equivalent already covers it.

**Ownership rule:** copy each Magic UI component into
`src/components/ui/magic/<name>.tsx`. Strip props we don't use. Replace any
hardcoded colors with our CSS variables (`var(--ring)`, `var(--foreground)`).
Never import directly from `magicui` packages.

---

### 2.3 Origin UI / 21st.dev — extra shadcn-style app & social components

**Status:** not yet installed. Origin UI and 21st.dev publish higher-density
shadcn-style components — closer to "real product UI" than Magic UI.

**Use Origin UI for:**

- **Buttons:** more-opinionated variants (icon button, button with
  shortcut/kbd, split button) — only if shadcn's base is insufficient.
- **Inputs:** input-with-leading-icon, input-with-clear, password input,
  tag-input, OTP input, slider with labels, search-with-cmdk.
- **Avatars + badges:** avatar group, status dot, presence badge.
- **Status / banner patterns:** announcement bars, alerts with action.
- **Tables / lists:** data list rows for the resources page.

**Use 21st.dev for:**

- **Social-product pieces:** comment thread, like-button-with-count,
  reaction-row, share-popover, save/bookmark toggle.
- **Image carousel** (gallery lightbox supplement).
- **Tag input** with dropdown suggestions.
- **Notification feed pattern** if/when needed.

**Do not use either for:**

- Hero theatrics (use Magic UI).
- Anything Radix already covers cleanly. Don't replace `Dialog` with a custom
  modal because it looks slightly different.

**Ownership rule:** same as Magic UI. Copy → `src/components/ui/origin/` or
`src/components/ui/21st/` (or fold into the closest existing primitive).
Translate every color and radius to our tokens before committing.

---

### 2.4 Aceternity UI — selective hero atmosphere

**Status:** not yet installed. **Use sparingly.** Aceternity's components are
the most visually loud of the four sources — they're great as a one-shot
moment and terrible as a UI system.

**Use it for, at most:**

- One hero spotlight or "lamp effect" on the homepage _or_ portal page (not
  both).
- One container-scroll or "sticky reveal" moment, somewhere on the site.
- `LinkPreview` on outbound links in the resources / writing pages —
  optional.
- `Sparkles` _only_ in the portal route, _not_ on body content.

**Do not use it for:**

- Buttons. Aceternity's buttons are too loud.
- Cards in archives.
- Backgrounds on more than one section per page.
- Any text effect that touches body copy.
- The dark reader / CJK reader experience — most Aceternity effects are
  English-tuned and break at CJK line breaks.

**Ownership rule:** copy in, name it after the role not the source
(`<HomeHeroSpotlight>` not `<AceternityLamp>`), and lean on tokens.

---

### 2.5 Custom CSS — last resort

Custom CSS in `src/app/globals.css` is reserved for:

- **Brand tokens** (already present — keep).
- **Layered atmospheric utilities** (already present:
  `.bg-cyber-grid`, `.archive-vignette`, `.scanline-layer`, `.noise-layer`,
  `.contact-sheet`, `.placeholder-noise`).
- **Theme overrides** (`[data-theme="dark"]` etc.).
- **Final glue** — page-shell-level scroll behavior, selection color, type
  setup.

Custom CSS is **not** for:

- One-off effects on a single component (use Tailwind utilities + a
  `data-state` attribute).
- Anything a shadcn or Radix component already provides.
- Per-page utility classes (`.about-hero-glow` etc.).

If a Tailwind utility doesn't exist for what you need, the answer is almost
always "use a CSS variable already in `:root`," not "add a new utility."

---

## 3. Component Ownership Rules

> Every component lives in our repo. We never re-render a third-party
> component as-is in a route.

1. **Copy, don't import.** Magic UI, Origin UI, 21st.dev, Aceternity — all
   copy-in. Do not add their packages to runtime dependencies.
2. **Tokenize on the way in.** Replace any hardcoded color, radius, or
   shadow with a value from our token set on the first commit.
3. **Rename by role.** Components imported into the project are named after
   what they _do_ on this site, not what they were called upstream.
   `MagicCard` → `MagicCard` only if it's _the_ MagicCard primitive used
   everywhere; otherwise it becomes `ProjectFeatureCard` or
   `GalleryHeroCard`.
4. **Storybook-first for non-trivial pieces.** Any new component that has
   more than two visual states gets a Storybook entry under
   `src/components/<area>/<name>.stories.tsx`.
5. **Locale-tested.** Any new layout component is verified at /en _and_ /zh
   widths in Playwright (project already runs the matrix).
6. **Token-only theming.** No `bg-[#...]` or `text-[#...]` arbitrary values
   in committed component code unless the value is impossible to express
   with a token.

---

## 4. How to Avoid Too Much Custom CSS

A short checklist applied to every new component:

- [ ] Does Tailwind have a utility for this? Use it.
- [ ] Does the existing token set cover it? Use `var(--token)` in arbitrary
      Tailwind values: `bg-[var(--surface-paper)]`, not a new utility.
- [ ] Is this a state I can model with `data-*` attributes?
      `data-state=open|closed`, `data-active`, `aria-current=page` — let
      Tailwind variant selectors do the work.
- [ ] Is this a **theme** difference? Theme variables are already covered
      via `[data-theme="..."]` overrides. Don't add a new media query.
- [ ] Am I about to add an animation? Use the `--motion-*` tokens and
      `--ease-premium` already defined.

If the answer to all five is "no," then _and only then_ consider adding to
`globals.css`. New entries must include a comment justifying the addition.

---

## 5. How to Avoid Visual Inconsistency

The biggest risk of pulling from four sources is that the site fragments
into "the home page using Magic UI" and "the gallery using Aceternity" and
"the project page using shadcn." To prevent that:

1. **One radius family.** `--radius` and its derivatives. Imported components
   that ship with `rounded-2xl` get rewritten to `rounded-lg` or
   `rounded-xl` to match.
2. **One shadow family.** Tailwind's `shadow-sm` / `shadow-md` /
   `shadow-lg`. No imported "neon glow" shadows.
3. **One border family.** `border-border` from the token. Imported
   components that use `border-zinc-200` get rewritten.
4. **One motion family.** `--ease-premium` + `--motion-*` durations. Imported
   components with `cubic-bezier(0.4, 0, 0.2, 1)` get retuned.
5. **One typography stack.** `var(--font-display)` for headlines,
   `var(--font-sans)` for UI, `var(--font-mono)` for labels. Imported
   components shipping with their own fonts get rewritten.
6. **One accent color in production.** `var(--ring)`. No second brand color
   even if a Magic UI hero "wants" pink/purple.
7. **One cadence of motion entry.** The site's reveal pattern is `FadeIn` /
   `Stagger` (already in `src/components/motion`). Imported
   components with their own scroll-trigger logic get rewritten to use ours
   or stripped of motion entirely.

A pull request that introduces a new shadow, radius, or accent color must
either replace the corresponding token globally or it gets bounced.

---

## 6. How to Keep the Site Unique With Prebuilt Components

The fear is: _if everyone pulls from shadcn + Magic UI, won't every site
look the same?_ It only does if you stop after install. Here's how this site
keeps its voice:

1. **Heavy editorial typography.** Most "shadcn sites" use generic sans for
   headlines. We use **Syne** for display. That single choice makes us look
   different from every other shadcn site instantly.
2. **A constrained palette.** Most premium libraries lean on
   indigo/purple/pink gradient hero combos. We have **one** accent (cyan
   `#0ea5b7` light, `#67e8f9` dark) on a **warm paper** background. That
   reads as a magazine, not a SaaS.
3. **Atmospheric layers.** The owned `cyber-grid`, `archive-vignette`,
   `scanline-layer` give every page a recognizable substrate. Most prebuilt
   components ship on flat white — we drop them onto our textured surface.
4. **Mono labels everywhere.** Every section opens with a mono eyebrow
   (`01 / 04 — selected systems`). No upstream library does this by
   default. It's a five-line component (`SectionHeading`) and it's our
   strongest signature.
5. **Photographic-first imagery.** Cards use real screenshots / photos with
   grayscale-on-rest, color-on-hover. Most templates use illustrations.
6. **No emoji, no stickers, no icon zoo.** Lucide is the only icon source,
   used at small sizes (`size-3.5` to `size-5`). That's already in the
   stack — keep it.
7. **Bilingual visible.** A locale switcher in the header, EN/ZH content
   parity, and Chinese-aware spacing/punctuation. Most prebuilt component
   demos are English-only.

If the redesign passes those seven, it will not look like a template even
if every component beneath it came from a registry.

---

## 7. How to Adapt Imported Components Into Project-Owned Components

The intake recipe — apply this to every Magic UI / Origin UI / Aceternity
component the redesign brings in:

1. **Drop into `src/components/ui/<source>/<name>.tsx`** (or fold into the
   closest existing primitive if the diff is small).
2. **Strip unused props.** If we'll only ever use one `variant`, delete the
   variant API.
3. **Tokenize.**
   - `bg-zinc-900` → `bg-background` or `bg-card`
   - `text-zinc-100` → `text-foreground`
   - `border-zinc-800` → `border-border`
   - hex colors → `var(--ring)`, `var(--foreground)`, `var(--muted-foreground)`
   - `rounded-2xl` → `rounded-lg` (or whatever the design calls for)
   - `shadow-2xl` → `shadow-lg`
   - hardcoded easings → `cubic-bezier(0.2,0.7,0.2,1)` (the
     `--ease-premium` curve)
   - hardcoded durations → `--motion-fast` / `--motion-medium` etc.
4. **Replace `framer-motion` imports** with `motion/react` (already present
   as `motion`).
5. **Add `prefers-reduced-motion` guards.** Wrap motion in
   `useReducedMotion()` from `motion/react`, or use the existing
   `FadeIn` / `Stagger` wrappers when possible.
6. **Add a Storybook story** if the component has more than one visual
   state.
7. **Remove third-party fonts.** Imported components sometimes ship with
   `font-mono` swapped to a non-Geist mono — restore.
8. **Rename by role** before committing.

Every adapted component should leave behind a one-line comment at the top:

```tsx
// Adapted from <source> · <component name> · phase 1 redesign
```

That's the only comment we keep — it gives later maintainers the upstream
trail without polluting the body.

---

## 8. Components to Install / Copy First (Phase 1)

In dependency order. Don't install everything; install in waves and ship.

### Wave 1 — shadcn primitives we don't own yet

```
Avatar, Separator, ScrollArea, Popover, DropdownMenu,
HoverCard, Skeleton, Sonner, Command, Form, Label,
Textarea, Carousel
```

### Wave 2 — Magic UI atmosphere + layout

```
BentoGrid, BentoCard, AnimatedGridPattern, BlurFade,
BorderBeam, NumberTicker, ShimmerButton, AnimatedBeam,
HeroVideoDialog, FileTree
```

### Wave 3 — Origin UI / 21st.dev social + density

```
TagInput, ButtonWithShortcut, AvatarGroup, AnnouncementBar,
LikeButton, SaveButton, SharePopover, ImageCarousel,
CommentThread (deferred to Phase 2)
```

### Wave 4 — Aceternity selective

```
HeroSpotlight (or LampEffect — pick one), ContainerScroll,
LinkPreview, Sparkles (portal page only)
```

Each wave gets its own PR. Each PR includes:

- The components copied in.
- The tokenization pass.
- Storybook entries.
- Use-site replacement (existing usage swapped to the new primitive).

---

## 9. Components to Avoid

These are explicitly out, even though they show up in the source registries
and look great in isolation:

### From Magic UI

- `RainbowButton` — fights the single-accent rule.
- `NeonGradientCard` — fights the editorial mood.
- `Confetti`, `Meteors` — childish at this scale.
- `RetroGrid` (the overtly synthwave version) — we already have a quieter
  cyber-grid.
- `OrbitingCircles` _unless_ it visualizes something real (e.g. tech orbit
  on the about page). Default: skip.
- `CoolMode` — joke component, never ships.

### From Aceternity

- `BackgroundGradientAnimation` — too SaaS, too loud.
- `MovingBorder` on buttons — fights motion budget.
- `WavyBackground` / `BackgroundBeams` on body sections — atmosphere belongs
  to one section per page max.
- `3DCardEffect` — banned (motion direction §7 in
  [REDESIGN_DIRECTION.md](./REDESIGN_DIRECTION.md)).
- `EvervaultCard`, `LampEffect` _together_ — pick one, not both.
- `Vortex` — visually impressive, completely off-brand.

### From Origin UI / 21st.dev

- Any neumorphism-leaning component.
- "Glassmorphism cards" if they don't degrade gracefully on the warm paper
  background.
- Any landing-page section preset (we compose our own sections).

### From shadcn

- `Toast` (legacy) — use `Sonner` instead.
- The `Dialog` "drawer-from-bottom" preset on desktop — use `Sheet` if
  side-mounted is needed.

---

## 10. Decision Quick-Reference

When a future agent is choosing where a new component should come from, run
this in order:

1. Is it accessible primitive (button, dialog, tabs, popover, menu, form
   control)? → **shadcn** (copy in, tokenize).
2. Is it a hero / atmosphere / motion piece? → **Magic UI** (copy in,
   tokenize, motion-budget check).
3. Is it social / app-density (likes, comments, share, tags, presence)? →
   **Origin UI / 21st.dev**.
4. Is it the _one_ signature scroll moment for a page? → **Aceternity**
   (and only one per page).
5. None of the above? → **Owned custom**, scoped to a single component
   file, no new global CSS unless absolutely necessary.

If you find yourself reaching for option 5 more than once per phase, stop —
you're rebuilding something that already exists upstream.

---

## 11. Performance Guardrails

Any component installed from §8 must pass these before merging:

- First-paint-safe: no client-only component blocks the page from rendering
  static content (use `next/dynamic` with `ssr: false` only for genuinely
  client-only effects).
- No new font request. We have three families already; that's the budget.
- No package over ~30KB gz added without justification. Most copy-in
  components ship as TSX with no runtime cost beyond `motion/react` (already
  present).
- Atmospheric backgrounds (grid, particles, beams) are limited to one per
  viewport. Two on the same screen at once is a perf bug.
- `Particles` count clamped to ≤40, `quantity` ≤30. Disable on mobile via
  `useMediaQuery`.
- Lighthouse mobile target: Performance ≥ 90, A11y ≥ 95, Best Practices ≥
  95, SEO ≥ 95. CI doesn't enforce this yet — manual check before merge.

---

## 12. When to Add a Fifth Source

Almost never. The four sources above cover ~95% of what a personal site
needs. Before introducing a fifth:

1. Document the gap in writing — what specifically is missing?
2. Show that the component can't be assembled from existing primitives in
   under ~80 lines.
3. Check that the new source is **copy-in** (no runtime dep we can't own).
4. Update this document with the new source and its boundaries.

A fifth source is a design decision, not a routine PR.
