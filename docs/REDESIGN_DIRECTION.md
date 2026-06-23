---
title: M4rkyu.com — Redesign Direction
status: living
audience: design + engineering agents (Claude, Codex, human collaborators)
last_updated: 2026-05-10
---

# Redesign Direction

> **Status as of 2026-05-10**: Sprints 1–5 shipped (24 PRs to
> `main`, #12–#35; see `git log --oneline`). Brand vocabulary, atmospheric
> stack, two-theme system, Cmd-K palette, sitemap + per-route OG,
> and PR CI are all live. This file remains the design north star —
> if a section conflicts with what shipped, the implementation wins
> and this file should be edited in a follow-up. See
> `AI_WORKFLOW.md` for cadence + conventions.
>
> **Route note:** the `/portal` route referenced below is historical — it
> was never shipped and is not in the current app tree. Treat portal
> mentions as design intent only, not a live route.

This is the creative brief for the **2027 m4rkyu.com**. It is
opinionated on purpose. Future agents should treat the calls in this file as
the first draft of design intent — not a menu of options to second-guess.

The goal is to ship a personal site that feels like a creative operating system
maintained by one person, not a portfolio template, not a SaaS landing page,
and not a shell wrapped around a CV.

---

## 1. Design Vision

> A personal creative operating system. Editorial in voice, terminal in
> precision, gallery in posture.

The site is one consolidated surface for software, games, digital art,
writing, and resources. It should read as a curated archive — closer to a
small magazine, design studio, or art-book imprint — while still behaving like
a fast, modern web app.

Three north stars:

1. **Curation over completeness.** Show fewer things, framed better. The site
   should look edited, not exhaustive.
2. **Atmosphere over decoration.** Mood is built from typography, spacing,
   restraint, and a small number of repeated motifs — not from layered
   effects.
3. **Reading speed over spectacle.** Hero motion is short. Body content is
   readable. The interesting part is the work, not the chrome.

---

## 2. Brand Adjectives

Use this list when judging proposals, components, and copy. If a candidate
fights more than one of these, drop it.

**Core (always true):**

- **Premium** — confident spacing, deliberate type, no "free template" tells.
- **Editorial** — magazine-grade hierarchy, captions, eyebrow tags, indices.
- **Precise** — gridded, monospaced labels, calm motion, exact alignment.
- **Quiet-futuristic** — terminal hints, scanlines, hairline grids, no
  cyberpunk cosplay.
- **Bilingual-native** — English and Simplified Chinese must both look
  intentional, not bolted on.

**Aspirational (lean toward):**

- **Curatorial** — like a small print magazine or label.
- **Patient** — content has room to breathe.
- **Personal** — feels like one person's archive, not an agency's case-study
  deck.

**Forbidden:**

- Childish, gamified, sticker-heavy.
- Generic SaaS ("Build faster. Ship smarter.")
- Random neon, multi-gradient hero soup, full-bleed glassmorphism.
- "Developer portfolio template" energy (giant emoji, rainbow skill bars,
  3D-rotating laptop mockups).
- Fake testimonials, fake clients, fake awards, fake metrics.

---

## 3. Visual Mood

Think "design studio archive viewed through a quiet terminal." Reference
points (for _posture_, not pixel mimicry):

- **Are.na** — curation, restraint, contact-sheet density.
- **Linear / Vercel** — typographic confidence, near-zero ornament.
- **VSCO / Cargo** — gallery presentation, generous frame whitespace.
- **Apple Newsroom / Apple Design Resources** — editorial layout, calm motion.
- **Teenage Engineering, Field Notes, Kinopio** — small-batch, object-grade
  feel.
- **Government Digital Service / GOV.UK** — readability discipline (sets the
  text-comprehension floor; everything else sits _on top_ of that).

Anti-references — don't take notes from these even when tempting:

- Awwwards "site of the day" sites with 14 parallax sections.
- Generic "developer in 2024" templates with diagonal stripes.
- Crypto/AI launchpads with starfield + gradient orbs.
- Maximalist Webflow bento dumps where every cell has a different gradient.

---

## 4. Typography Direction

The current stack already declares the right families — keep them, formalize
the system.

**Families** (already defined in [src/app/globals.css](../src/app/globals.css)):

- **Display:** `Syne` — for `h1`, `h2`, hero, eyebrows on big sections.
- **Body / UI:** `Geist` — for paragraphs, cards, body copy, navigation.
- **Mono:** `Geist Mono` — for indices (`01 / 04`), eyebrows, captions, code,
  metadata, kbd, system labels.

**Scale (target, fluid):**

| Role           | Size                          | Weight  | Tracking              | Notes                      |
| -------------- | ----------------------------- | ------- | --------------------- | -------------------------- |
| Display XL     | `clamp(3rem, 8vw, 7rem)`      | 700–800 | -0.02em               | Homepage hero, 404, portal |
| Display L      | `clamp(2.25rem, 5vw, 4rem)`   | 700     | -0.015em              | Page headers               |
| Display M      | `clamp(1.5rem, 3vw, 2.25rem)` | 600     | -0.01em               | Section titles             |
| Body L (lede)  | 1.125rem / 1.7                | 400     | normal                | Intro paragraphs           |
| Body           | 1rem / 1.65                   | 400     | normal                | Default reading            |
| Body S         | 0.875rem / 1.6                | 400     | normal                | Card body, metadata        |
| Eyebrow / Mono | 0.65–0.75rem                  | 500     | 0.18–0.32em uppercase | Indices, system labels     |
| Caption        | 0.75rem / 1.5                 | 400     | normal                | Photo captions, footnotes  |

**Rules:**

- One display family. One UI family. One mono family. **No fourth font.**
- Body line-length cap: ~70ch. Wider columns are for galleries, not text.
- Uppercase tracking is reserved for mono eyebrows and tags. Never apply
  uppercase tracking to body or display.
- `text-balance` (already styled) is preferred for headlines and short hero
  copy.
- CJK type: use the system Chinese stack via the existing `Geist Fallback`
  chain. Do not ship a heavy CJK web font in phase 1; rely on system
  Source Han / PingFang / Microsoft YaHei.

---

## 5. Spacing Direction

**Rhythm:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px (Tailwind defaults).
Avoid arbitrary `[27px]` values.

**Page rhythm:**

- Standard section: `py-20` (80px), with `py-16` (64px) on smaller pages and
  `py-28` reserved for hero / closing call-to-action moments.
- Standard horizontal padding: `px-4 sm:px-6 lg:px-8` with content capped at
  `max-w-7xl`.
- Editorial pages (case studies, blog post body) cap at `max-w-3xl` for prose,
  break out to `max-w-7xl` for figures.

**Component rhythm:**

- Cards: `p-6` body, `p-4` for compact list items, `p-8` for hero cards.
- Stack gaps: `gap-3` for chips, `gap-4` for related items, `gap-6` for cards
  in a grid, `gap-10`+ for cross-section composition.

**Whitespace intent:** the design must look _generous_ on a 27" monitor and
still feel deliberate at 360px. If the homepage doesn't feel slightly empty
on first load, it's not editorial enough yet.

---

## 6. Color Direction

The existing tokens in [src/app/globals.css](../src/app/globals.css) are
already on the right path — they are the source of truth, not a starting
point to throw away. Treat them as the brand palette.

**Light theme — "paper":**
A warm, off-white archive paper (`#f5f3ee`) with deep ink (`#0a0a0a`) and a
muted teal/cyan signal (`--ring: #0ea5b7`). Reads as a magazine page.

**Dark theme — "ink":**
Near-black surface (`#050505`) with bone-white text (`#f2f0ea`) and a brighter
signal cyan (`--ring: #67e8f9`). Reads as a darkroom.

**Monochrome theme — "kiln":**
Pure grayscale, signal disabled. Reserved for gallery-first browsing and a
"quiet mode."

**Kernel theme — "kernel":**
Dark with phosphor green (`#5dff9d`). Reserved for the `/portal` route and
optional easter eggs. Not a default. Not promoted in nav.

**Hard rules:**

- Body color is `--foreground` on `--background`. No exceptions for "vibe."
- Accent is `--ring` (the active theme's accent), plus up to two further inks
  `--ring-2` / `--ring-3`. **Three inks max per theme**, no fourth, no rainbow.
  (Themes are user-selectable — see
  [UNIFIED_VISUAL_DIRECTION.md §5.4](./UNIFIED_VISUAL_DIRECTION.md#54-multi-theme-system-shipped-2026-06).)
- `--signal` is for _state_ (live, recording, attention) — not decoration.
- `--success`, `--warning`, `--destructive` exist for status badges only.
- Gradients are allowed only as **atmospheric layers** (radial wash behind
  hero, vignette under photo grids). Never on text. Never on buttons.
- Never tint imagery with the brand cyan. Photography stays photographic.
- No pure-black `#000` on dark mode. Use the theme's `--background`.

---

## 7. Motion Direction

**Philosophy:** motion should feel like a camera focusing — confident, brief,
purposeful. It should never be the reason a section exists.

**Existing tokens** (in [globals.css](../src/app/globals.css)) — keep these:

- `--motion-micro: 120ms` (hover state, focus ring)
- `--motion-fast: 180ms` (chip toggle, color shift)
- `--motion-medium: 280ms` (card lift, dialog open)
- `--motion-slow: 500ms` (page section reveal)
- `--motion-cinematic: 800ms` (hero text reveal, only on first paint)
- `--ease-premium: cubic-bezier(0.2, 0.7, 0.2, 1)`

**Patterns we keep:**

- `FadeIn` and `Stagger` on first scroll into view.
- Hero text "y: 105% → 0%" reveal (already in `HeroSection`). One time only.
- Card hover: `y: -4` to `y: -6`, no scale, no rotate, no glow.
- Marquee strip in hero, kept restrained (font mono, low-contrast, no color).
- Lenis smooth scroll (already installed) — keep, but never on
  `prefers-reduced-motion`.

**Patterns to add (selectively):**

- **BlurFade** on gallery tiles loading in (Magic UI–style).
- **Number ticker** for one or two real metrics on the home page (years
  building, repos shipped — only if numbers are real and earned).
- **Animated beam** between two cards on the homepage to visualize
  "engineer → artist → designer" range. One time, hero-adjacent only.
- **Border beam** on a single high-impact card (e.g. featured project), never
  more than one in view at once.

**Patterns to ban:**

- Parallax that moves more than 24px.
- Continuous looping animations outside the hero marquee.
- Scroll-jacked sections (no full-page snap on the marketing pages) — **except
  the home hero scroll-cinema (see note below)**.
- 3D card tilts on hover.
- Sparkle / particle systems on body content.
- Any animation longer than 800ms on user-initiated interaction.

`prefers-reduced-motion` is honored globally already — every new motion must
respect it.

> **Update (2026-06-23) — Home spine condense + cinematic entrances.** The home
> is being re-pointed from a long row of full-height sections into a shorter,
> denser set of **acts** — Hero · Ask · **Build** (Work + Games) · **Field**
> (Visual + Writing + Resources) · **Connect** (About + CTA) — with Compass
> folded into the nav. Each combined act is one `<section>` stage with one
> shared backdrop (members render via `HomeSection`'s new `embedded` mode), and
> its content lands with a bolder **deep-blur → scale-up** scroll entrance
> (`src/components/motion/cinematic-reveal.tsx`); the hero wordmark blurs and
> lifts away on exit. This relaxes "Reading speed over spectacle" for the home
> spine on the owner's call. **Guardrails still honored:** `motion/react`
> (`useInView` reveals; the hero exit keeps its existing GSAP scrub), every
> entrance is `prefers-reduced-motion`-safe (renders the resting state), real
> bilingual SSR copy, three-ink + token-driven. The relaxation is scoped to the
> home spine — every other surface keeps the no-scroll-jack rule. (Rolling out
> act-by-act; `BuildStage` is the first landed.)

---

## 8. Page Narratives

Each page has a one-sentence job. If a section in that page doesn't serve the
sentence, cut it.

### 8.1 Homepage — "the index"

**Job:** show, in under 90 seconds, that one person builds across software,
games, art, writing, and tools — and earn the click into one of those.

**Narrative beats:**

1. Hero: identity statement (Engineer · Artist · Designer), short subtitle,
   two CTAs, ambient visual card.
2. **What I'm building right now** — a 3-card "current focus" strip
   (project / game / writing) with live status pills. _New section._
3. Featured projects (3, real only).
4. Gallery preview — a contact-sheet bento (4–6 images), opens to /gallery.
5. Now / writing pulse — newest blog post + newest devlog, side by side.
6. Tools & resources — 3-card teaser to /resources.
7. Closing strip: one-line statement + email CTA + portal link.

**Cut from current homepage:**

- The "archive pulse tabs" (writing/resources/games) — split into two simpler
  strips (gallery preview + writing strip). Tabs on a homepage feel like a
  dashboard; the homepage should feel like a magazine cover.
- The "collaboration" services block — moves to /contact.

### 8.2 Gallery — "the contact sheet"

**Job:** make people stop scrolling. The gallery is the most public-facing,
share-friendly surface — it must look first-class on a phone in a DM.

**Narrative beats:**

1. Quiet header: title, optional 1-line statement, total frame count.
2. Collection chips (filter): All / Black & White / Artworks / Travel / etc.
3. **Masonry-aware contact sheet** — 2 / 3 / 4 columns, generous gutters,
   light hover only.
4. Lightbox (already exists, gets upgraded — see
   [GALLERY_SOCIAL_SPEC.md](./GALLERY_SOCIAL_SPEC.md)).
5. Featured collections row at the bottom (3 large cards into
   `/gallery/[collection]`).

The gallery is the **first place** to invest in the social model (likes /
saves / share / tags). See `GALLERY_SOCIAL_SPEC.md`.

### 8.3 Projects — "the studio archive"

**Job:** read like a small studio's case-study book. Each project earns its
own page; the archive is the table of contents.

**Narrative beats:**

1. Header: "Work index." Tiny status block: `N production · N in dev`.
2. Filter row: category chips + year selector (existing `_client.tsx` keeps
   shape, gets visual upgrade).
3. Grid of `ProjectCard`s — large, image-led, restrained.
4. Optional: "currently maintaining" subsection at the bottom.

Project detail pages (`/projects/[slug]`) follow a fixed editorial template
(see [COMPONENT_MAP.md](./COMPONENT_MAP.md) §7).

### 8.4 Blog / Devlog — "the field notes"

**Job:** signal that this person _thinks_, not just ships. Writing is short,
opinionated, dated, and tagged.

**Narrative beats:**

1. Header: "Writing & devlog."
2. Tag chips (engineering / design / games / process).
3. Timeline list (date · title · excerpt · reading time · tag).
4. Optional pinned essay at top.
5. Article pages: editorial measure (`max-w-3xl`), drop-cap optional, MDX.

Devlog entries share the same surface — distinguished by tag, not by route.

### 8.5 Games — "the workshop"

**Job:** show the same person can ship interactive systems, with the same
seriousness as the software work — without inventing fake game pages.

**Narrative beats:**

1. Header.
2. Grid of game cards (cover, engine, year, status, short pitch).
3. Game detail = case-study template + a "playable / build" block that
   gracefully degrades when no build exists yet.

### 8.6 About — "the operator"

**Job:** answer "who is this and why should I trust their taste" in one
screen.

**Narrative beats:**

1. Portrait + 2–3 sentence statement.
2. Values (already exists, keep, simplify visual).
3. Timeline (already exists, keep, polish dotted-line treatment).
4. "Now" block — a real, short status: where, what, what's open.
5. Soft CTA into /contact.

### 8.7 Contact — "the open channel"

**Job:** make it obvious how to reach the person, and keep the form honest.

**Narrative beats:**

1. Big email link as the headline (the form is a backup, not the main move).
2. Public channels list (email, GitHub, optional Discord/X if real).
3. "What I'm open to" block (3 chips, real services, no fake price tiers).
4. Form (existing, keep, polish empty/error states).

No fake response time SLAs, no fake calendar embed unless wired to a real
booking page.

### 8.8 Tools / Resources — "the curated stack"

**Job:** be the page people actually bookmark. A real personal stack with
short _why this exists_ notes — closer to a stripped-down Are.na channel than
an affiliate page.

### 8.9 Portal — "the easter egg"

**Job:** be the one weird, atmospheric, un-marketing page. Lives outside the
main nav cadence. Locked-terminal aesthetic. Not load-bearing for hiring.

---

## 9. What the Site Should Feel Like

Read these aloud. If a future change makes any of them less true, push back.

- "This is one person's archive, edited carefully."
- "It's quiet, but the work is loud."
- "It feels old enough to be confident and new enough to be alive."
- "Nothing here is decorative. Everything earned its spot."
- "The English and the Chinese versions feel like the same thing."
- "I would actually read this on my phone."

---

## 10. What the Site Must Avoid

- More than three inks in a single theme (the active `--ring` + `--ring-2` +
  `--ring-3`), or rainbow palettes. (Themes are user-selectable now — see
  [UNIFIED_VISUAL_DIRECTION.md §5.4](./UNIFIED_VISUAL_DIRECTION.md#54-multi-theme-system-shipped-2026-06).)
- Hero animations longer than 1s combined.
- Components that depend on JS to render their first paint.
- Content that pretends to be social (fake testimonials, fake counters).
- Custom CSS for things shadcn/Radix already solves (dialog, tabs, popover,
  tooltip, sheet).
- Inventing per-project page components (`<NimbusPage />`, `<BioLoomPage />`).
  All project and game routes are `[slug]`-driven, data-first.
- Marketing copy ("ship faster", "10× developer", "let's build the future").
- Bilingual handling that copies English structure into Chinese without
  thinking about CJK punctuation, spacing, and line-break behavior.

---

## 11. Section Idea Bank

Polished, taste-forward sections to reach for _when a page genuinely needs
one_. Don't ship them all. Pick one or two per page, max.

**Hero treatments:**

- _Layered headline_ — three-line display headline with one dim line in the
  middle (already in use, keep).
- _Identity card_ — atmospheric mono "spec sheet" card next to the headline
  (already in use, refine).
- _Live status pill_ — "Currently building [title]" with a `--signal`
  indicator. One sentence. Real link.
- _Animated grid pattern_ (Magic UI) as background — used once, on the home
  hero only.

**Section openers:**

- _Eyebrow + title + 1-line description_ (existing `SectionHeading` pattern,
  keep as the default).
- _Index pair_ — `01 / 04 — selected systems` style mono index above title.
- _Pull-quote_ between sections (rare, editorial pages only).

**Card treatments:**

- _Bento grid_ (Magic UI) on the homepage — uneven cells, single restrained
  hover. No more than 6 cells.
- _Border beam card_ for one featured item per page.
- _Contact-sheet card_ (existing `bg-cyber-grid` + image frame) for archive
  surfaces.

**Atmospheric layers (already in CSS):**

- `bg-cyber-grid` for hero / archive headers.
- `archive-vignette` to fade content into background on dark sections.
- `scanline-layer` very sparingly — portal page and one hero only.

**Closing strips:**

- _One-sentence statement + 2 CTAs._ That's it. No "Subscribe to my
  newsletter" if there's no newsletter.

---

## 12. First Implementation Phase

Do **not** attempt a big-bang redesign. Sequence the work so each phase ships
something coherent.

### Phase 1 — Foundation refresh (1–2 weeks of focused work)

1. **Lock the design tokens.** Document the existing CSS variables in
   `src/app/globals.css` as the canonical token set. No new tokens unless a
   page demands one.
2. **Install the candidate UI sources** (see
   [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md)) — shadcn registry
   parity check, Magic UI cherry-pick (Bento, BorderBeam, NumberTicker,
   AnimatedGridPattern, BlurFade, ShimmerButton).
3. **Redesign the homepage** to the narrative in §8.1. Replace the tab block,
   add the "current focus" strip, add the gallery contact-sheet preview, add
   the writing pulse strip.
4. **Polish the gallery index** to support the social MVP layer in
   [GALLERY_SOCIAL_SPEC.md](./GALLERY_SOCIAL_SPEC.md) — likes + share + tags
   only. No comments yet.
5. **Polish the project detail template** to the spec in
   [COMPONENT_MAP.md](./COMPONENT_MAP.md) §7.
6. **Audit content for placeholders.** Replace draft strings on production
   routes; mark anything that can't ship as `coming-soon` and route it
   through existing placeholder primitives.

Phase 1 acceptance: homepage, gallery, /projects, /projects/[slug] all read
as a coherent design system. Other routes can still look like the current
draft.

### Phase 2 — Social + content layer

- Gallery social MVP (likes, share, tags, related).
- Blog/devlog redesign (MDX, drop-cap, tag filter).
- Comments backend decision (see `GALLERY_SOCIAL_SPEC.md` §11).

### Phase 3 — Atmosphere + experiments

- Portal page becomes a real interactive moment (still optional, still
  outside main nav cadence).
- One signature scroll moment on the homepage (animated beam or scroll
  reveal).
- Optional: a "now" page with weekly notes.

---

## 13. Risks to Watch

- **Visual creep.** Magic UI / Aceternity components are easy to over-install.
  Anything that can't justify itself in three words gets removed.
- **Inconsistency between locales.** CJK tracking, line-height, and punctuation
  break English-tuned components. Verify every new layout in /zh.
- **Custom CSS sprawl.** Every new utility class added to `globals.css`
  should be reviewed against the existing token set first.
- **Fake-engagement temptation.** No likes-counter that increments without a
  backend. No "as seen in" logos that aren't real. No award shelves.
- **Performance regressions from atmospheric layers.** The cyber-grid /
  scanline / noise layers must stay GPU-cheap. No `backdrop-filter` over
  full-screen photographic content.
- **Mobile 360px parity.** Most "premium" portfolio designs collapse at
  360–390px. Every layout must be reviewed at 360 / 390 / 768 / 1280 / 1920.

---

## 14. Companion Documents

- [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md) — what to install, what
  to avoid, how to keep ownership.
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) — page-by-page composition with
  recommended primitives.
- [GALLERY_SOCIAL_SPEC.md](./GALLERY_SOCIAL_SPEC.md) — the gallery's social
  layer, MVP through future backend.

When in doubt, this document wins on _intent_ and `COMPONENT_MAP.md` wins on
_composition_.
