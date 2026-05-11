---
title: M4rkyu.com — Final Site Architecture
status: living (post-Phase-8)
audience: implementation agents (Claude, Codex), reviewers, future contributors
last_updated: 2026-05-11
supersedes_partial: docs/REDESIGN_DIRECTION.md (extends — see §0)
companion: docs/UNIFIED_VISUAL_DIRECTION.md, docs/COMPONENT_MAP.md, docs/UI_LIBRARY_STRATEGY.md, docs/PHASE_8_AUDIT.md
---

# Final Site Architecture — "M4RKYU.SYS"

The source of truth for the post-Phase-8 site shape: IA, routes, header
model, page-by-page wow factors, the component source matrix, motion rules,
terminal mode, bilingual constraints, performance budget, and the PR
roadmap that will get us there.

This doc collects decisions; the *why* lives in the companions linked
above. When this doc and an older doc disagree, **this one wins for
structure**, the older docs win for visual tone and existing component
contracts.

---

## 0. How this doc relates to the others

- [REDESIGN_DIRECTION.md](./REDESIGN_DIRECTION.md) — the original north
  star (premium / editorial / quiet-futuristic). Still authoritative on
  *tone*.
- [UNIFIED_VISUAL_DIRECTION.md](./UNIFIED_VISUAL_DIRECTION.md) — the
  cyber-pixel hybrid thesis. Still authoritative on *visual hierarchy*
  and the 70 / 20 / 10 split.
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) — page-by-page composition for
  the *current* route structure. Will be migrated to the new routes as
  PR #59 lands.
- [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md) — which library each
  primitive comes from (shadcn / Magic UI / owned-pixel / PixelAct /
  Aceternity). Still authoritative on library boundaries.
- [PHASE_8_AUDIT.md](./PHASE_8_AUDIT.md) — the audit + deferred-cosmetic
  log. Items called out as `DEFERRED` there are tracked in §13 here.

---

## 1. Final identity

> **M4RKYU.SYS — a premium cyber-pixel command center.**
> A bilingual, editorially-paced archive that *boots up* like a developer
> console. Software, games, and quiet frames — one operator.

Voice: **indie, precise, quietly cinematic, technically literate.**
Not: startup-SaaS, LinkedIn-bio, fake-hacker, award-site grandeur.

The site reads like a personal archive built by someone who ships
production code, prototypes games, and keeps a visual journal. It is
not a portfolio template.

---

## 2. Compact IA

Three top-level surfaces + utility routes. Everything else is sub-route
or alternate-shell.

```
Work        — software, games, AI tools, enterprise, experiments
Archive     — photography, artworks, film/visual studies, collections
Logs        — writing, devlog, field notes, resources
About       — operator dossier
Contact     — open the channel
```

Utility routes (not in main nav):

```
/resume       — printable system dossier
/terminal     — power-user shell (entry point for Cmd-K)
/portal       — controlled easter egg
```

---

## 3. Exact route map

```
/                                  → redirect /en
/[locale]                          → Home
/[locale]/work                     → Work index
/[locale]/work/[slug]              → Work detail
/[locale]/archive                  → Visual archive
/[locale]/archive/[collection]     → Archive collection
/[locale]/logs                     → Logs index (writing + devlog + notes)
/[locale]/logs/[slug]              → Log detail
/[locale]/resources                → Stack map
/[locale]/about                    → Operator dossier
/[locale]/contact                  → Open channel
/[locale]/resume                   → Printable dossier
/[locale]/terminal                 → Terminal shell
/[locale]/portal                   → Easter egg
```

### 3.1 Migration from current routes

Current routes (Phase 8 state) → target:

| Current                          | Target                    | Note                          |
| -------------------------------- | ------------------------- | ----------------------------- |
| `/[locale]/projects`             | `/[locale]/work`          | Rename + redirect             |
| `/[locale]/projects/[slug]`      | `/[locale]/work/[slug]`   | Slugs preserved               |
| `/[locale]/games`                | `/[locale]/work` (filter) | Games merge in as `type=game` |
| `/[locale]/games/[slug]`         | `/[locale]/work/[slug]`   | Slugs preserved               |
| `/[locale]/gallery`              | `/[locale]/archive`       | Rename + redirect             |
| `/[locale]/gallery/[collection]` | `/[locale]/archive/[c]`   | Slugs preserved               |
| `/[locale]/blog`                 | `/[locale]/logs`          | Rename + redirect             |
| `/[locale]/blog/[slug]`          | `/[locale]/logs/[slug]`   | Slugs preserved               |
| `/[locale]/media`                | merged into `/archive`    | Cut as standalone             |

Redirects ship in PR #59. Old paths get `next.config.ts` redirects
(308 permanent) so external links survive.

---

## 4. Header / dropdown model

### 4.1 Desktop (≥1024px)

```
[M4RKYU.SYS]   Work ▾   Archive ▾   Logs ▾   About   Contact      >_   EN/ZH   Theme
```

- Brand mark on the left links to `/[locale]`.
- Three dropdown groups (Work / Archive / Logs).
- Two flat links (About / Contact).
- Right cluster: terminal hint, language switcher, theme switcher,
  sound toggle.

### 4.2 Mobile (<1024px)

```
[M4RKYU.SYS]                                                          Menu
```

Single hamburger opens a shadcn `Sheet`. Sheet content mirrors the
desktop dropdown groups as collapsible sections.

### 4.3 Dropdown contents

**Work**
```
All Work          → /work
Software          → /work?type=software
Games             → /work?type=game
AI Tools          → /work?type=ai
Enterprise        → /work?type=enterprise
Experiments       → /work?type=experiment
```

**Archive**
```
Visual Archive    → /archive
Photography       → /archive/photography
Artworks          → /archive/artworks
Film / Studies    → /archive/film
Collections       → /archive (collection list)
```

**Logs**
```
Writing           → /logs?type=writing
Devlog            → /logs?type=devlog
Field Notes       → /logs?type=note
Resources         → /resources
```

### 4.4 Primitives used

| Surface         | Primitive                    |
| --------------- | ---------------------------- |
| Desktop dropdown| shadcn `NavigationMenu`      |
| Mobile menu     | shadcn `Sheet`               |
| Cmd-K palette   | shadcn `Command`             |
| Theme + lang    | existing owned switchers     |
| Sound toggle    | existing owned toggle        |

**Do not custom-build accessibility on top of nav.** Use shadcn/Radix
behavior; theme the surface with pixel tokens only.

---

## 5. Page-by-page layouts

Compressed layout per page. Full composition lives (or will live, post
migration) in [COMPONENT_MAP.md](./COMPONENT_MAP.md).

### 5.1 Home (`/[locale]`)
CommandHero · numbered capability spine · featured work strip · recent
logs strip · archive teaser · HUD strip.

### 5.2 Work index (`/[locale]/work`)
Filter chips (All / Software / Games / AI / Enterprise / Experiments) ·
MissionModuleCard grid · selector glyph on hover.

### 5.3 Work detail (`/[locale]/work/[slug]`)
ProjectCartridge header (category-aware: SYSTEM MODULE / GAME MODULE) ·
metadata strip · long-form sections · media module · related work.

### 5.4 Archive index (`/[locale]/archive`)
Contact-sheet grid (photographic, **not** pixelated, **not** cyan-tinted)
· hover metadata reveal · quiet lightbox · collection links.

### 5.5 Archive collection (`/[locale]/archive/[collection]`)
Film-slate opener (name · place/date · short note · frame count) · hero
print frame · contact-sheet grid for the collection.

### 5.6 Logs index (`/[locale]/logs`)
Dated timeline · log type chip · reading time · tag channel · hover
preview line.

### 5.7 Log detail (`/[locale]/logs/[slug]`)
Editorial title · mono metadata strip · system-label tags · calm
readable body (**no pixel font in article body**) · related logs.

### 5.8 Resources (`/[locale]/resources`)
Inventory-style categories · resource cards with "why it exists" ·
optional FileTree stack panel.

### 5.9 About (`/[locale]/about`)
Portrait/avatar · current-focus panel · timeline · values · one human
line.

### 5.10 Contact (`/[locale]/contact`)
Big email headline · terminal prompt label · contact methods as command
rows · form as secondary · restrained success state.

### 5.11 Resume (`/[locale]/resume`)
Clean document layout · experience as system records · skills by
category · download CTA · print-friendly CSS.

### 5.12 Terminal (`/[locale]/terminal`)
See §9.

### 5.13 Portal (`/[locale]/portal`)
Locked kernel screen · one interactive reveal · link back to main site.
**Not in main nav.**

---

## 6. Page wow factors

Every page gets **one** signature moment — not zero, not five.

| Route        | Wow factor                                            |
| ------------ | ----------------------------------------------------- |
| `/`          | Cinematic boot-sequence command hero                  |
| `/work`      | Selectable mission-file grid + selector glyph         |
| `/work/[s]`  | System cartridge case-study header                    |
| `/archive`   | Cinematic contact sheet with quiet lightbox           |
| `/archive/[c]` | Film-slate opener                                   |
| `/logs`      | Field-note timeline                                   |
| `/logs/[s]`  | Field-report article header                           |
| `/resources` | Stack map / tool inventory                            |
| `/about`     | Operator dossier                                      |
| `/contact`   | Open-channel console                                  |
| `/resume`    | Printable system dossier                              |
| `/terminal`  | Navigable portfolio shell                             |
| `/portal`    | Controlled easter egg                                 |

---

## 7. Component source matrix

Five sources, strict boundaries. The detailed rules are in
[UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md).

| Concern                         | Source                              |
| ------------------------------- | ----------------------------------- |
| Behavior (menus, dialogs, etc.) | **shadcn / Radix**                  |
| Atmosphere (one per viewport)   | **Magic UI**                        |
| Cyber-pixel accents             | **Owned `src/components/ui/pixel`** |
| Pixel design inspiration only   | **PixelAct UI** (no install)        |
| One controlled hero moment      | **Aceternity** (max one route)      |

### 7.1 shadcn used for
DropdownMenu, NavigationMenu, Sheet, Dialog, Command, Tabs, Popover,
Select, Form, Input, Textarea, ScrollArea, Accordion, Carousel, Sonner,
AspectRatio, Avatar.

### 7.2 Magic UI used for
BlurFade, BentoGrid, BorderBeam, AnimatedGridPattern, PointerSpotlight,
ShineBorder, NumberTicker, AnimatedBeam, ShimmerButton, FileTree.

Rules: one atmospheric primitive visible per viewport. No rainbow
gradients. No neon overload. No body-text effects. No particles on
mobile. No more than one BorderBeam in view at once.

### 7.3 Owned pixel primitives
PixelPanel, PixelButton, SystemBadge, SectionFrame, StatusPulse,
PixelTransitionOverlay, SoundToggle, CommandHero, GameHud,
MissionModuleCard, ProjectCartridge.

These accept tokens only — no hardcoded hex, no `bg-zinc-*` palette
names. Storybook coverage matrix lives in §13.

### 7.4 PixelAct UI
Inspiration only. Pull design ideas (button, terminal input, pixel
border, status chip) but do **not** install or replace existing shadcn
primitives.

### 7.5 Aceternity
At most one controlled moment site-wide (e.g. hero spotlight OR
container scroll OR link preview — pick one). Not for 3D cards,
vortex backgrounds, sparkles, or loud gradients.

---

## 8. Motion system

### 8.1 Rules

- One atmospheric effect per viewport.
- Transitions are *cinematic*, not playful: 200–400ms ease-out for
  microinteractions, 400–700ms for route transitions.
- Pixel transitions on route change (PixelTransitionOverlay) cap at
  one per navigation event.
- No GSAP. No Three.js. No WebGL on main routes. (Justifiable
  exceptions live in a separate PR.)

### 8.2 Reduced motion

`@media (prefers-reduced-motion: reduce)` collapses durations to 1ms
globally today. Phase-9 cleanup adds explicit early-returns on
PixelTransitionOverlay and StatusPulse — see [PHASE_8_AUDIT.md §2](./PHASE_8_AUDIT.md)
and §13 below.

### 8.3 Mobile

Disable Particles. Optionally disable scanline if frame-time exceeds
budget. Keep hero animations; cut decorative ones.

---

## 9. Terminal mode

Terminal is an **optional alternate shell**, not the main navigation.

### 9.1 Route + entry points

- `/[locale]/terminal` — full-page shell.
- `Cmd-K` palette — opens the same parser in a dialog (shadcn `Command`).

### 9.2 Foundations

Build the parser first, UI second:

```
src/lib/terminal/terminal.types.ts        — typed result shape
src/lib/terminal/terminalCommands.ts      — command registry
src/lib/terminal/terminalParser.ts        — tokenize + dispatch
```

Parser returns typed results (`{ kind, payload }`), not JSX. The UI
layer maps results to renderers.

### 9.3 Commands

```
help                  about                 ls
ls work               ls archive            ls logs
cat <slug>            open <slug>           logs
status                resume                contact
clear                 theme dark            theme light
lang en               lang zh               exit
```

### 9.4 Content source

Terminal output reads from `src/content/**` and `messages/*.json`.
No hardcoded long descriptions inside terminal components.

---

## 10. Bilingual rules

### 10.1 Locale propagation

`/en` sets `lang="en"`, `/zh` sets `lang="zh"` on `<html>`. The CJK
guard in [src/app/globals.css](../src/app/globals.css) uses `:lang(zh)`
to redirect `--font-pixel` to a CJK-safe display stack.

### 10.2 VT323 must not leak to Chinese

Pixel components that render translated copy must not bake VT323 into
the Chinese render path. Audit surfaces:

```
SystemBadge          PixelButton          SectionFrame (eyebrow/index)
CommandConsole       Terminal output      MissionModuleCard
ProjectCartridge
```

### 10.3 Message namespaces (target)

Existing: `Navigation`, `Home`, `Hud`, `Status`, `Theme`, `Language`.

To add (one per PR as consumers land):

```
Work       Archive    Logs       Resources
About      Contact    Resume     Terminal
Common
```

### 10.4 Hand-written Chinese

No literal awkward translation. Examples already in repo:

```
Open the channel → 开启对话
Logs            → 日志 / 现场笔记 (context-dependent)
Work            → 作品 / 工作档案 (context-dependent)
Archive         → 档案 / 视觉档案 (context-dependent)
```

---

## 11. Performance budget

### 11.1 Targets

- LCP ≤ 2.5s on /en/ + /zh/ home over 4G.
- CLS ≤ 0.1.
- TBT ≤ 200ms.
- Lighthouse Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.

### 11.2 Rules

- One atmospheric effect per viewport.
- Lazy-load archive media; never load full-res by default.
- Disable Particles on mobile.
- Keep client-component count low — every `"use client"` must justify
  itself with hooks, events, browser API, or a client-only lib.
- Important copy must be crawlable HTML — no canvas, WebGL, terminal-
  only, or client-widget-only content for primary information.

### 11.3 CI integration (deferred)

`@axe-core/playwright` + Lighthouse CI integration are tracked as PR
#70 — they may add devDependencies and need their own scoped PR.

---

## 12. PR roadmap

```
#55  chore(qa): phase 8 audit follow-up                              ✓ merged
#56  chore(architecture): define final M4RKYU.SYS site architecture  ← this PR
#57  chore(pixel): stabilize cyber-pixel foundation
#58  feat(shell): compact dropdown app shell
#59  feat(routes): align Work / Archive / Logs routes
#60  feat(home): command center hero polish
#61  feat(home): page signature moments / capability spine
#62  feat(work): work index + work detail template
#63  feat(archive): cinematic visual archive
#64  feat(logs): logs index + article layout
#65  feat(resources): stack map page
#66  feat(terminal): parser + terminal route
#67  feat(command): Cmd-K terminal entry
#68  feat(audio): SoundToggle polish
#69  polish(motion): cinematic transitions
#70  chore(qa): Lighthouse/axe/mobile/bilingual audit
```

Each PR sticks to one concern. Cross-cutting refactors get carved off
into their own PRs.

---

## 13. Phase-8 deferred items tracked here

These items shipped as `DEFERRED` in [PHASE_8_AUDIT.md](./PHASE_8_AUDIT.md)
and need to be addressed during the matching roadmap PR:

| Item                                              | Lands in PR |
| ------------------------------------------------- | ----------- |
| Reduced-motion early-returns (PixelTransitionOverlay, StatusPulse) | #57 |
| GameHud `<nav><ul>` semantics                     | #57         |
| SoundToggle tooltip dedupe                        | #68         |
| Atmospheric layer WCAG AA contrast measurement    | #70         |
| Storybook coverage matrix for pixel primitives    | #57         |
| Token-only styling audit (no `bg-zinc-*`, no hex) | #57         |
| `@axe-core/playwright` + Lighthouse CI            | #70         |

---

## 14. Acceptance criteria

The site is "done" relative to this doc when:

- Header is compact and uses shadcn primitives for behavior.
- `/work` contains games. `/archive` replaces `/gallery` + `/media`.
  `/logs` replaces `/blog`. Old paths 308-redirect.
- Every page has exactly one signature moment.
- Terminal is reachable but optional.
- Pixel layer is restrained — accents only, not the whole language.
- Chinese is hand-written, not machine-shaped.
- Lighthouse Performance ≥ 90, Accessibility ≥ 95.
- The site reads as: indie, editorial, technical, cinematic, personal,
  bilingual, fast, accessible, memorable.
- The site does **not** read as: generic-portfolio, startup-SaaS,
  fake-hacker, childish-pixel-game, copied-award-site, LinkedIn-bio,
  template.
