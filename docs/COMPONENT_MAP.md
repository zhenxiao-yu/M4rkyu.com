---
title: M4rkyu.com — Component Map
status: living
audience: implementation agents (Claude, Codex), reviewers
last_updated: 2026-05-10
---

# Component Map

> **Status as of 2026-05-10**: every public route in this map has
> shipped (homepage, projects + slug, games + slug, gallery + slug,
> blog timeline, media, resources, about, contact, portal, 404). The
> `/tools` route was cut in Phase 4.5 — it duplicated `/resources`
> and was orphaned. Section-by-section composition below is still
> useful as a reference; flag drift in a follow-up if a page strays.

Page-by-page composition for the redesign. Each section answers:

- **Purpose** — what this page does, in one sentence.
- **Ideal UX** — what success feels like for a visitor.
- **Layout** — the recommended structure.
- **UI sources** — which library each piece comes from.
  See [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md) for the rules.
- **Reuse** — existing components that already cover the need.
- **Build** — components that must be created (named).
- **Data** — where the page reads from.
- **Mobile** — how it adapts at 360–768px.
- **A11y** — non-trivial accessibility notes.
- **Risks / what not to custom-build / redesign opportunity** —
  guardrails for future implementers.

Routes referenced come from the existing `[locale]` structure. All locale
behavior must be preserved (`/en` and `/zh`).

---

## 0. Conventions Used in This Document

- **`Owned`** — component already in `src/components/...`.
- **`shadcn`** — copy-in shadcn primitive (Wave 1 in Library Strategy §8).
- **`Magic UI`** — copy-in atmosphere/motion component.
- **`Origin/21st`** — copy-in app-density / social component.
- **`Aceternity`** — selective hero piece.
- **`new`** — must be authored for the redesign.
- **`reuse`** — already authored, no changes needed.
- **`refactor`** — already authored, needs a polish pass.

---

## 1. Homepage — `/[locale]`

Source today: [src/app/[locale]/page.tsx](../src/app/[locale]/page.tsx).

**Purpose.** Establish the operator's range (engineer · artist · designer)
and route visitors to the work surface that fits them within ~90 seconds.

**Ideal UX.** Lands clean. One headline that anchors identity. A glance at
"what's live right now." Three featured projects. A glimpse of the gallery.
A glimpse of writing. One quiet CTA.

**Layout (top → bottom):**

1. **Hero** — identity headline + ambient spec card (kept, refactored).
2. **Status strip** — "now / shipping / writing" (new).
3. **Featured projects** (3) — kept, refactored card visual.
4. **Gallery preview** — bento contact-sheet (new).
5. **Writing pulse** — newest post + newest devlog (refactored from
   tab block).
6. **Tools strip** — 3 cards into /resources (new, replaces tabs block).
7. **Closing strip** — single statement + email + portal CTA (new).

**UI sources / per-section:**

| Section         | Build / Reuse | Source                                                                  |
| --------------- | ------------- | ----------------------------------------------------------------------- |
| Hero headline   | `refactor`    | Owned `HeroSection` + Magic UI `BlurFade`                               |
| Hero ambient bg | `new`         | Magic UI `AnimatedGridPattern` (replaces our `bg-cyber-grid` here only) |
| Hero CTA        | `reuse`       | Owned `Button`, with one Magic UI `ShimmerButton` for the primary CTA   |
| Hero side card  | `refactor`    | Owned card, optional Magic UI `BorderBeam` once                         |
| Status strip    | `new`         | Owned `Card` + new `StatusPulseRow`                                     |
| Featured grid   | `refactor`    | Owned `ProjectCard`                                                     |
| Gallery preview | `new`         | Magic UI `BentoGrid` + new `GalleryBentoTile`                           |
| Writing pulse   | `new`         | Owned `Card` + new `WritingPulseRow`                                    |
| Tools strip     | `new`         | Owned `Card` + new `ResourcePreviewCard`                                |
| Closing strip   | `new`         | Owned `Button` + new `ClosingCTAStrip`                                  |

**Existing reuse:** `HeroSection`, `SectionHeading`, `ProjectCard`,
`Stagger`, `FadeIn`, `Marquee`, `PageShell`, `Button`, `Badge`, `Card`.

**New components:**

- `StatusPulseRow` (`src/components/sections/`) — three-cell row with a live
  status pill (dot + label + short detail + link).
- `GalleryBentoTile` (`src/components/gallery/`) — bento cell wrapping
  `next/image` with grayscale-on-rest, color-on-hover.
- `WritingPulseRow` (`src/components/sections/`) — newest post + newest
  devlog side-by-side, mono date + tag chip.
- `ResourcePreviewCard` (`src/components/cards/`) — compact resource teaser.
- `ClosingCTAStrip` (`src/components/sections/`) — one-sentence + 2 buttons.

**Data:**

- `featuredProjects` (already in `src/content/projects.ts`).
- `posts` (newest 1–2) and `posts` filtered by `category === "devlog"`.
- `galleryItems` filtered to `status === "ready"` for the bento.
- `resources` (top 3 by curated order, not random).

If `featuredProjects.length < 3`, render only the available count and let the
grid collapse — never pad with placeholders on the homepage.

**Mobile:**

- Hero: side card hidden under `lg`. Headline goes to 3 lines, marquee stays.
- Status strip: 1 column with horizontal swipe (`ScrollArea` from shadcn).
- Featured: 1 column.
- Gallery preview: 2-up bento at sm, 1-up at xs.
- Writing: stacked.
- Closing: stacked, full-width buttons.

**Accessibility:**

- Hero motion respects `prefers-reduced-motion`. The marquee pauses on focus
  inside it.
- All section headings use `h2` after the page `h1` in the hero.
- Status pills include `aria-label` text — the colored dot is decorative.

**Risks:**

- Over-stuffing the homepage. Hard cap: 7 sections.
- Bento + animated-grid on the same first viewport is too busy — keep
  `AnimatedGridPattern` strictly behind the hero, not behind the bento.
- "Status pulse" is tempting to fake. Wire it to real content fields
  (`featured`, `status`, `date`) — never hand-write "Currently building X."

**Don't custom-build:** the bento layout. Use Magic UI's `BentoGrid`.
Skinning it to match our tokens is a 15-minute job; rewriting it isn't.

**Redesign opportunity:** the existing `tabs` block is the weakest section
on the page. Replacing it with a writing-pulse + tools strip alone is the
single biggest visual upgrade we can ship.

---

## 2. Gallery Index — `/[locale]/gallery`

Source today: [src/app/[locale]/gallery/page.tsx](../src/app/[locale]/gallery/page.tsx)

- [`_client.tsx`](../src/app/[locale]/gallery/_client.tsx).

**Purpose.** A scrollable visual archive that feels first-class on a phone.
The most share-friendly route on the site.

**Ideal UX.** Lands on a quiet header, a row of collection chips, then a
large contact-sheet grid. Each frame opens a polished lightbox with social
affordances. Filter by collection without page reload.

**Layout:**

1. **Header** — title, one-sentence statement, total frame count (mono).
2. **Collection filter row** — chips (All + each collection).
3. **Contact-sheet grid** — masonry-aware, 2 / 3 / 4 columns.
4. **Featured collections** — 3 large cards into `/gallery/[collection]`.
5. **Lightbox modal** (route-state via `?frame=...`, already implemented).

**UI sources:**

| Section             | Build      | Source                                                              |
| ------------------- | ---------- | ------------------------------------------------------------------- |
| Header              | `reuse`    | Owned `SectionHeading`                                              |
| Filter chips        | `refactor` | Owned `Badge` + new `CollectionFilterChips`                         |
| Contact sheet       | `refactor` | Owned `GalleryGrid` + new `GalleryBentoTile` (shared with homepage) |
| Featured cards      | `reuse`    | Owned `ArchiveCard`                                                 |
| Lightbox            | `refactor` | Owned `Dialog` + new `GalleryLightbox`                              |
| Lightbox carousel   | `new`      | shadcn `Carousel` (Embla) inside the dialog                         |
| Like / Save / Share | `new`      | Origin/21st patterns + new `GalleryActions`                         |

**Existing reuse:** `Dialog`, `Card`, `Badge`, `Button`, `PlaceholderImage`,
`SectionHeading`, `FadeIn`, `Stagger`.

**New components:**

- `CollectionFilterChips` (`src/components/gallery/`) — filterable chip row,
  syncs with `?collection=...` query param.
- `GalleryLightbox` (`src/components/gallery/`) — replaces the inline dialog
  in `_client.tsx`. Carries the social affordances and pinch-zoom on touch.
- `GalleryActions` (`src/components/gallery/`) — like / save / share /
  copy-link cluster (see [GALLERY_SOCIAL_SPEC.md](./GALLERY_SOCIAL_SPEC.md)).
- `GalleryBentoTile` — shared with homepage.

**Data:**

- `galleryCollections` and `galleryItems` from
  `src/content/gallery.ts`.
- (Phase 2) likes / save state from chosen backend.

**Mobile:**

- Grid: 2 columns at `<sm`, 3 at `md`, 4 at `lg`. No virtualization needed
  until item count exceeds ~80.
- Lightbox: full-screen `Sheet` from `bottom` on `<md`, `Dialog` on `≥md`.
- Pinch-zoom on tap-and-hold for touch devices.
- Filter chips horizontally scroll on `<sm`, with `mask-image` fade at
  edges.

**Accessibility:**

- Each tile is a `<button>` (already correct in current `_client.tsx`).
- Lightbox traps focus (Radix `Dialog` already handles this).
- Arrow-key navigation already present — preserve. Add `Home` / `End` to
  jump to first / last frame.
- Image `alt` is mandatory and pulled from `galleryItem.caption`. Empty
  alt = decorative; this is **not** decorative.

**Risks:**

- Masonry layout on the web without reflow flicker is hard. Use CSS
  `column-count` for the layout, not JS, and intermix portrait / landscape
  images via the schema (add an aspect hint to `galleryItemSchema`).
- Filter state must survive page reload. Use `?collection=` not local
  state.
- Likes / saves are easy to fake. **Don't.** See spec.

**Don't custom-build:** the dialog, the carousel inside it, focus
trapping. Radix + shadcn `Carousel` cover all of it.

**Redesign opportunity:** the gallery is the route most likely to drive
external traffic (DM-able, shareable). Phase 1 should treat it as the
flagship redesign target after the homepage.

---

## 3. Gallery Post / Detail Modal — `?frame=<slug>`

The lightbox lives as a modal over the gallery. There is no separate
fullscreen route in Phase 1 (deep-links via `?frame=` are enough).

**Purpose.** Show one frame at full attention with metadata, related work,
and quiet social affordances.

**Ideal UX.** Modal opens. Image is the hero (pinch-zoom on touch). Caption,
date, collection chip, tag chips. Like / save / share buttons. Prev / next
controls. Three related frames at the bottom.

**Layout (top → bottom inside modal):**

1. **Top bar** — close · counter (`12 / 48`) · share · save.
2. **Image** — full-width, dominant.
3. **Meta row** — title · collection chip · tag chips · capture date if any.
4. **Caption** — short, optional.
5. **Action row** — like (count) · save · share · copy-link.
6. **Prev / Next** — large hit targets on left/right edges.
7. **Related** — 3 small thumbs ("From this collection").

**UI sources:**

| Section        | Source                                                       |
| -------------- | ------------------------------------------------------------ |
| Modal shell    | shadcn `Dialog` (desktop) / `Sheet` bottom (mobile)          |
| Image          | `next/image` with `priority` while open                      |
| Carousel logic | shadcn `Carousel` (Embla)                                    |
| Action row     | Origin/21st like/save/share patterns, owned `GalleryActions` |
| Related thumbs | Owned `GalleryBentoTile` at compact size                     |

**Build:**

- `GalleryLightbox` (described above).
- `GalleryActions` (described above).
- `GalleryRelatedRow` — small new component, takes `current` and resolves
  3 nearest collection-mates.

**Data:**

- `galleryItems` for prev/next/related resolution.
- Action state — see Gallery Social Spec.

**Mobile:**

- Bottom-sheet variant. Image fills width, info stacks below.
- Swipe horizontally for prev/next (native gesture via Embla).

**Accessibility:**

- `aria-label` on prev/next buttons.
- `Esc` closes (Radix default).
- `aria-live="polite"` on the counter for screen readers when navigating.

**Risks:**

- Image preloading: prefetch the next image when the modal is open to avoid
  jitter. Cap to ±1 to keep memory low.

**Don't custom-build:** the carousel transitions or focus trap.

**Redesign opportunity:** the lightbox is where social affordances feel
natural without polluting the grid. Concentrate engagement UI here.

---

## 4. Gallery Collection Page — `/[locale]/gallery/[collection]`

Source today: [src/app/[locale]/gallery/[collection]/page.tsx](../src/app/[locale]/gallery/[collection]/page.tsx).

**Purpose.** A dedicated page for one curated body of work
(e.g. "Black & White"). Same lightbox, fewer chips.

**Ideal UX.** A magazine-feature feel. Cover image on top, a short curatorial
note, and a tighter contact sheet underneath.

**Layout:**

1. **Hero cover** — full-bleed image (collection.cover), with the title
   and description overlaid in the lower-left corner.
2. **Meta row** — frame count · date range (if any) · tag pills.
3. **Contact sheet** — same `GalleryGrid` filtered to this collection.
4. **Footer** — "Other collections" row (other collections excluding self).

**UI sources:**

| Section       | Source                              |
| ------------- | ----------------------------------- |
| Hero cover    | `next/image` + new `CollectionHero` |
| Contact sheet | shared `GalleryGrid` from §2        |
| Other rows    | Owned `ArchiveCard`                 |

**Build:**

- `CollectionHero` (`src/components/gallery/`) — image + overlaid title +
  description, with a subtle gradient mask for legibility.

**Data:** `galleryCollections.find(c => c.slug === slug)` and
`galleryItems.filter(i => i.collection === slug)`.

**Mobile:**

- Hero shrinks to 16:9 (or 4:5 if portrait cover).
- Title block sits below the image, not overlaid, on `<sm`.

**Accessibility:**

- Overlaid title must pass contrast against the gradient mask.
- If contrast can't be guaranteed (light cover image), drop the overlay and
  place the title underneath — that decision goes in `CollectionHero` props.

**Risks:**

- Cover crop on small screens. Use `object-cover` with focal-point hints in
  the schema (add `cover.focal: "top" | "center" | "bottom"`).

**Don't custom-build:** the gallery grid (reused from §2).

**Redesign opportunity:** treat the collection page as a small zine — it is
the right surface for an editorial intro paragraph that would feel out of
place on the gallery index.

---

## 5. Projects Archive — `/[locale]/projects`

Source today: [src/app/[locale]/projects/page.tsx](../src/app/[locale]/projects/page.tsx)

- [`_client.tsx`](../src/app/[locale]/projects/_client.tsx).

**Purpose.** A studio's index of case studies. Filterable, year-aware,
honest about which entries are still in development.

**Ideal UX.** A monumental "WORK · INDEX" header, a row of category chips,
a year selector, then a generous 3-column grid that breathes. No clever
sort: most recent ready-to-ship first, drafts after, archive at the bottom.

**Layout:**

1. **Header** — eyebrow `WORK INDEX`, large display title, intro line.
2. **Status block** (right rail on `lg`) — "N production · N in dev,"
   no fake metrics.
3. **Filter bar** — category chips + year selector (existing).
4. **Project grid** — `ProjectCard` 3-column.
5. **Drafts section** (collapsible) — projects with
   `contentStatus !== "ready"` grouped here.
6. **Maintenance row** (optional) — projects with `status === "maintenance"`.

**UI sources:**

| Section      | Source                                              |
| ------------ | --------------------------------------------------- |
| Header       | Owned `SectionHeading`                              |
| Status block | Owned `Card`                                        |
| Filter bar   | Owned `Badge` + shadcn `Select`                     |
| Grid         | Owned `ProjectCard`                                 |
| Drafts       | shadcn `Collapsible` + new `DraftProjectsAccordion` |

**Existing reuse:** `ProjectCard`, `Card`, `Badge`, `SectionHeading`,
`PageShell`.

**New components:**

- `DraftProjectsAccordion` — wraps the draft list in a collapsible block to
  avoid drowning the production work.

**Data:** `allProjects` from `src/content/projects.ts`.

**Mobile:**

- Header collapses to single column.
- Filter row scrolls horizontally.
- Grid: 1 column at `<sm`, 2 at `md`, 3 at `lg+`.

**Accessibility:**

- Filter chips are buttons with `aria-pressed`.
- Year `Select` is a Radix `Select` — keyboard-friendly out of the box.

**Risks:**

- Adding sort options just to add them. Default sort is
  `status:ready desc → year desc`. Don't expose user-controlled sort yet.

**Don't custom-build:** the year `Select`. Use shadcn `Select`.

**Redesign opportunity:** the page already has good bones. The lift is
mostly typography and grid breathing room — and consolidating the draft
projects so the "real" archive isn't watered down.

---

## 6. Project Detail (Generic) — `/[locale]/projects/[slug]`

Source today: [src/app/[locale]/projects/[slug]/page.tsx](../src/app/[locale]/projects/[slug]/page.tsx).

**Purpose.** One editorial template that serves every project. **Never**
build per-project pages.

**Ideal UX.** Reads like a magazine case study: title, role, year, stack
ribbon, then problem / solution / architecture / outcome — with screenshots
between the heavy text blocks. Footer offers "next project" and "all
projects."

**Layout (single template, data-filled):**

1. **Eyebrow** — category · year · status.
2. **Title** (display) + short pitch.
3. **Meta ribbon** — role · stack chips · live + repo links.
4. **Hero figure** — first screenshot or large placeholder.
5. **Problem** + **Solution** (paired, two columns on `lg`).
6. **Stack & architecture notes** (bullet list + small file-tree if
   applicable).
7. **Features** (compact card row).
8. **Process gallery** (remaining screenshots, masonry).
9. **Outcome** (pull-quote style block).
10. **Lessons learned** (numbered list).
11. **Next steps** (numbered list, marked as "in progress" if `status !==
ready`).
12. **Footer** — prev/next project nav + "Back to archive."

**UI sources:**

| Section          | Source                                              |
| ---------------- | --------------------------------------------------- |
| Display title    | Owned typography                                    |
| Meta ribbon      | Owned `Badge`, shadcn `HoverCard` for stack tooltip |
| Hero figure      | `next/image`                                        |
| File tree        | Magic UI `FileTree` (only when truly relevant)      |
| Process gallery  | shadcn `Carousel` or Magic UI `BentoGrid`           |
| Outcome quote    | new `PullQuoteBlock`                                |
| Prev/next footer | new `CaseStudyFooter`                               |

**New components:**

- `CaseStudyHeader` — eyebrow + title + pitch + meta ribbon.
- `CaseStudySection` — typed wrapper for problem / solution / outcome
  (controls measure, eyebrow, vertical rhythm).
- `PullQuoteBlock` — large display-font pull quote, optional attribution.
- `CaseStudyFooter` — prev/next + back-to-archive.

**Data:** `getProject(slug)` from `src/content/projects.ts`. Locale variants
from `project.translations[locale]` via existing `localize()` helper.

**Mobile:**

- All two-column splits collapse.
- Stack chips wrap onto multiple lines; the row scrolls horizontally only as
  a fallback.
- Process gallery becomes a swipeable carousel.

**Accessibility:**

- One `h1` per page (the project title). Sections are `h2`.
- Stack chips have `aria-label` describing the tech.
- Live / repo external links open in new tabs with `rel="noopener noreferrer"`.

**Risks:**

- Per-project temptation. **Hard rule:** no `NimbusPage`,
  `BioLoomPage`, etc. Everything goes through `[slug]`.
- Schema drift. Adding optional fields to `projectSchema` is fine; renaming
  required ones requires updating every project entry in
  `src/content/projects.ts`.
- Overlong process galleries. Cap to 8 screenshots in the visible
  carousel; everything beyond goes to a "view all" sheet.

**Don't custom-build:** the carousel, the file tree, the hover card.

**Redesign opportunity:** this is where the editorial voice lands hardest.
Invest in display typography, generous figure margins, and a single tasteful
pull quote per project.

---

## 7. Games Archive — `/[locale]/games`

Source today: [src/app/[locale]/games/page.tsx](../src/app/[locale]/games/page.tsx).

**Purpose.** Show interactive work with the same seriousness as the
software work. No fake "Steam page" energy.

**Ideal UX.** Header, then a grid of game cards (cover, engine, year,
status, short pitch). Click into a generic game detail.

**Layout:**

1. **Header** — eyebrow `WORKSHOP`, title, intro.
2. **Filter row** — engine chips (Unity / Godot / web / etc.).
3. **Game grid** — 2 / 3-column.
4. **In-progress strip** — games with `status === "draft"` or
   `coming-soon`.

**UI sources:**

| Section | Source                 |
| ------- | ---------------------- |
| Header  | Owned `SectionHeading` |
| Filter  | Owned `Badge`          |
| Grid    | new `GameCard`         |

**New components:**

- `GameCard` (`src/components/cards/`) — same visual language as
  `ProjectCard`, but with `engine` instead of `category` and a "Watch
  trailer" affordance when a video URL exists.

**Data:** `games` from `src/content/games.ts`. Schema may need:

- `cover: imageSchema` — already supported on related schemas, add to
  `gameSchema`.
- `trailerUrl?: string` — for the future Magic UI `HeroVideoDialog` use.

**Mobile:** 1 / 2 column.

**Accessibility:** same as Projects.

**Risks:**

- Inventing playable embeds. If there's no real WebGL build, do not invent
  one. The card links to a write-up.

**Don't custom-build:** the trailer dialog. Use Magic UI `HeroVideoDialog`.

---

## 8. Game Detail (Generic) — `/[locale]/games/[slug]`

**Purpose.** Editorial template for one game. Same template, never per-game.

**Ideal UX.** Cover, pitch, engine + year + role, design pillars, gameplay
clips, postmortem, links.

**Layout:**

1. **Eyebrow** — engine · year · status.
2. **Title** + pitch.
3. **Meta ribbon** — role · platforms · status.
4. **Hero media** — trailer (if exists) or cover image.
5. **Pillars / loop** — 3-cell card row of design pillars.
6. **Process gallery / clips** — Magic UI `HeroVideoDialog` cards.
7. **Postmortem / notes** — typography-heavy block.
8. **Build links** — itch.io / GitHub / Steam / WebGL (only if real).
9. **Footer** — prev/next.

**UI sources:**

| Section      | Source                                 |
| ------------ | -------------------------------------- |
| Hero trailer | Magic UI `HeroVideoDialog`             |
| Pillars      | Owned `Card`                           |
| Postmortem   | Owned typography                       |
| Footer       | new `CaseStudyFooter` (shared with §6) |

**Build:**

- `GameDetailTemplate` — shares header/footer with project template; differs
  only in metadata block and trailer affordance. Reuse `CaseStudySection`,
  `PullQuoteBlock`, `CaseStudyFooter`.

**Data:** `games.find(g => g.slug === slug)`.

**Mobile:** stacked layout, trailer dialog is full-screen.

**Accessibility:**

- Trailer dialog must include a transcript link or captioned video. If
  neither exists, the trailer doesn't ship — show a still frame instead.

**Risks:** sharing too much code with Projects can leak project-only fields
into game UI. Keep the templates compositionally similar, but separate.

**Don't custom-build:** the video dialog.

---

## 9. Blog / Devlog — `/[locale]/blog`

Source today: [src/app/[locale]/blog/page.tsx](../src/app/[locale]/blog/page.tsx).

**Purpose.** Field notes — short, opinionated, dated, tagged. Devlog and
essays share the same surface, distinguished by tag.

**Ideal UX.** A timeline list, not a card grid. Skimmable. Editorial measure
on the article body. Tag chips at the top to narrow.

**Layout:**

1. **Header** — eyebrow `WRITING & DEVLOG`, title, intro.
2. **Tag chips** — engineering / design / games / process / notes.
3. **Pinned essay** (optional, one slot).
4. **Timeline list** — date · title · excerpt · reading time · tag chip.
5. **Pagination** (only if list grows beyond 30).

**UI sources:**

| Section    | Source                 |
| ---------- | ---------------------- |
| Header     | Owned `SectionHeading` |
| Tag chips  | Owned `Badge`          |
| Timeline   | new `PostListItem`     |
| Pagination | shadcn `Pagination`    |

**New components:**

- `PostListItem` — single timeline row with mono date and tag chip. Hover
  shifts background subtly (no scale, no shadow).
- `PinnedPostCard` — used at most once, top of list.

**Data:** `posts` from `src/content/posts.ts`. Phase 2 introduces MDX
articles under `src/content/posts/<slug>.mdx` once the article surface is
ready.

**Mobile:** stacked.

**Accessibility:**

- List uses a real `<ol>` for chronological semantics.
- Tag chips toggle with `aria-pressed`.

**Risks:**

- Drift toward "blog grid with covers." Avoid — list form is the entire
  point.

**Redesign opportunity:** drop-cap on essay first paragraph, `figure` +
`figcaption` for inline images, MDX components for `<Pull />`,
`<Note />`, and `<Code />`.

### 9.1 Post Detail — `/[locale]/blog/[slug]` (Phase 2)

Not yet routed. When introduced:

- Editorial measure (`max-w-3xl`).
- Optional drop-cap on first paragraph.
- TOC (right rail on `lg+`) using shadcn `ScrollArea` + intersection
  observer.
- Footer: tags, prev/next post.

---

## 10. About — `/[locale]/about`

Source today: [src/app/[locale]/about/page.tsx](../src/app/[locale]/about/page.tsx).

**Purpose.** Answer "who is this and why trust their taste" in one screen.

**Ideal UX.** Portrait, short statement, values, timeline, a calm "now"
block, soft CTA.

**Layout:**

1. **Hero** — split: portrait (right) + statement (left).
2. **Values** + **Timeline** — paired cards.
3. **Now** block — current focus, location, openness, single CTA.

**UI sources:**

| Section | Source                                |
| ------- | ------------------------------------- |
| Hero    | Owned `SectionHeading` + `next/image` |
| Cards   | Owned `Card`                          |
| CTA     | Owned `Button`                        |

**Existing reuse:** the page is already close to its target — refine
spacing and replace `PlaceholderImage` with real portrait when ready.

**New components:** none required.

**Data:** `profile` from `src/content/profile.ts`.

**Mobile:** stacked.

**Accessibility:** portrait `alt` must describe the person, not the photo.

**Risks:** padding the page with fake "fun facts" or hobby chips. Keep it
short.

**Don't custom-build:** the timeline. The current dotted-border treatment
is owned and works.

---

## 11. Contact — `/[locale]/contact`

Source today: [src/app/[locale]/contact/page.tsx](../src/app/[locale]/contact/page.tsx).

**Purpose.** Make it obvious how to reach the operator.

**Ideal UX.** A massive email link as the headline — that's the primary
action. The form is the backup. Public channels listed honestly.

**Layout:**

1. **Headline** — `mailto:` link as `h1`, display size.
2. **Channels list** — Email · GitHub · (optional Discord/X if real).
3. **Open to** — 3 chips with real services (no fake price tiers).
4. **Form** — name, email, intent, message; existing `_contact-form.tsx`.

**UI sources:**

| Section  | Source                                                      |
| -------- | ----------------------------------------------------------- |
| Headline | Owned typography                                            |
| Channels | Owned `Button` (variant link)                               |
| Form     | Owned `_contact-form` + shadcn `Form`/`Textarea` (refactor) |

**Existing reuse:** `_contact-form.tsx` — refactor to use shadcn `Form` for
proper a11y and validation.

**New components:**

- `ContactChannelsList` — vertical list of email + social.
- `OpenToRow` — three chips backed by `services` data.

**Data:** `profile.email`, `services` from `src/content/services.ts`.

**Mobile:** stacked, full-width form.

**Accessibility:**

- Form errors announced via `aria-live`.
- Submit button disabled state has `aria-disabled` and visible affordance.

**Risks:** spam. Use a hidden honeypot field plus a server-side rate limit
when the backend lands. **No reCAPTCHA** — too heavy and not on-brand.

---

## 12. Tools / Resources — `/[locale]/resources`

Source today: [src/app/[locale]/resources/page.tsx](../src/app/[locale]/resources/page.tsx)

- [`_client.tsx`](../src/app/[locale]/resources/_client.tsx).

**Purpose.** A real personal stack with short _why_ notes — the page people
bookmark.

**Ideal UX.** Filterable by category. Each item shows name, category,
why-this-exists, link, optional pricing chip.

**Layout:**

1. **Header** — eyebrow `STACK`, title, intro.
2. **Category filter chips**.
3. **Resource list** — list rows, not cards (denser, more readable).
4. **Footer** — submit-suggestion link to email or GitHub Discussions if
   wired.

**UI sources:**

| Section        | Source                                         |
| -------------- | ---------------------------------------------- |
| Header         | Owned `SectionHeading`                         |
| Filter         | Owned `Badge`                                  |
| Resource rows  | Origin UI density patterns + new `ResourceRow` |
| External links | Aceternity `LinkPreview` (selective, optional) |

**New components:**

- `ResourceRow` — single row: icon · name · category chip · why · pricing
  chip · external arrow.

**Data:** `resources` from `src/content/resources.ts`.

**Mobile:** rows stack metadata under name; arrow stays right-aligned.

**Accessibility:**

- Each row is a single anchor. Hover + focus styles match.
- External links: `rel="noopener noreferrer"` and `aria-label` indicates
  external.

**Risks:**

- Affiliate-page energy. Keep `pricing` honest ("free", "$10/mo", "open
  source") — never invented.

**Don't custom-build:** anything Origin UI's list patterns already cover.

---

## 13. Portal — removed

The previous `/[locale]/portal` surface no longer exists in the current app
tree. Do not recreate it from this historical map unless a new phase explicitly
restores the route and updates the route map, navigation, sitemap, and docs in
the same change.

**Purpose.** The one weird, atmospheric, un-marketing page. Easter egg
energy. Outside main nav cadence.

**Ideal UX.** Locked-terminal look. Boot lines. A single CTA back to the
archive. Optional "kernel mode" toggle that swaps to the `kernel` theme.

**Layout:** kept close to current. Optional Aceternity `Sparkles` on the
display title only. **No** sparkles on body content.

**UI sources:**

| Section       | Source                                                    |
| ------------- | --------------------------------------------------------- |
| Headline      | Owned typography + Aceternity `Sparkles` (optional, once) |
| Terminal card | Owned `Card` + `font-mono`                                |
| Theme toggle  | Owned `ThemeSwitcher` (kernel mode)                       |

**Existing reuse:** the page is already on-brand. Refactor to swap one
button to `ShimmerButton` and one heading to a sparkles-wrapped headline.

**New components:** none required.

**Data:** static.

**Mobile:** keep current single-column behavior.

**Accessibility:** decorative effects must not block keyboard focus or
screen-reader output. Sparkles wrap should have `aria-hidden`.

**Risks:**

- Drift into a "real product" page. The portal must stay weird, optional,
  and unlinked from primary nav (it's already only in the header CTA — keep
  that).

**Don't custom-build:** the sparkles or theme toggle.

---

## 14. 404 — `not-found.tsx`

Currently not implemented. Add one at `src/app/[locale]/not-found.tsx` and
`src/app/not-found.tsx` (root fallback).

**Purpose.** Soft landing for broken links — match the brand voice.

**Ideal UX.** A confident display headline (`404 — off the contact sheet`).
Two CTAs: home and gallery. Optional small "recently shipped" strip.

**Layout:**

1. Display headline.
2. One-sentence subtitle.
3. Two buttons: `Home` · `Gallery`.
4. Optional: 3 `ProjectCard`s (most recent ready).

**UI sources:**

| Section  | Source                                          |
| -------- | ----------------------------------------------- |
| Headline | Owned typography + optional Magic UI `BlurFade` |
| Buttons  | Owned `Button`                                  |
| Cards    | Owned `ProjectCard`                             |

**New components:**

- `NotFoundHero` — small wrapper.

**Data:** `featuredProjects.slice(0, 3)`.

**Mobile:** stacked, full-width buttons.

**Accessibility:** 404 page must still render the global header + footer
(skip-to-content link, language switcher).

**Risks:** funny 404s age badly. Keep it dry.

**Don't custom-build:** wholly new layout — reuse `PageShell`.

---

## 15. Global Navigation — `Header`

Source today: [src/components/layout/header.tsx](../src/components/layout/header.tsx).

**Purpose.** Move between top-level surfaces, switch theme + language, and
expose the `/portal` CTA.

**Ideal UX.** Sticky, low-profile, reads as a magazine masthead. Items
collapse to a `Sheet` mobile nav at `<xl`.

**Layout (existing, refined):**

- Left: brand mark (`M4`).
- Center: nav links (Projects · Games · Gallery · Blog · Media ·
  Resources · About · Contact).
- Right: `ThemeSwitcher` + `LanguageSwitcher` + `Portal` CTA.

**UI sources:**

| Section           | Source                                  |
| ----------------- | --------------------------------------- |
| Sticky shell      | Owned                                   |
| Nav links         | Owned `NavLink`                         |
| Mobile sheet      | Owned `MobileNav` (uses shadcn `Sheet`) |
| Theme switcher    | Owned                                   |
| Language switcher | Owned                                   |
| Command palette   | shadcn `Command` — new addition         |

**New components:**

- `CommandPalette` (`src/components/system/`) — Ctrl/Cmd-K opens a `Command`
  dialog with all routes, recent gallery items, and recent posts. Magic UI
  `ShimmerButton` not required; the trigger is keyboard-only.

**Data:** `navItems` array (existing) + `recent` slices from gallery /
posts content.

**Mobile:**

- Brand + theme + language + hamburger visible at `<xl`.
- Sheet expands from right.

**Accessibility:**

- `aria-current="page"` on active nav links (already implemented in
  `NavLink`).
- Skip-to-content link at top of `PageShell` (already implemented).
- `Cmd-K` palette: documented in palette UI itself.

**Risks:**

- Adding too many nav items. Hard cap at 8. If a 9th surface lands
  ("now," "newsletter"), promote one of the current 8 into a child of
  another (e.g. "Media" goes under Gallery).

**Don't custom-build:** the command palette, the sheet.

---

## 16. Footer

Source today: [src/components/layout/footer.tsx](../src/components/layout/footer.tsx).

**Purpose.** Calm wrap-up. Brand + work links + connect links + small
colophon.

**Ideal UX.** Two or three columns at most. No newsletter form. No "back to
top" button (the brand mark in the header acts as one).

**Layout (existing, refined):**

- Left: brand statement.
- Center: Work links.
- Right: Connect links.
- Bottom: copyright + tagline.

**UI sources:** all owned.

**New components:**

- `ColophonBar` — bottom row, optionally lists "built with Next.js · hosted
  on Vercel · last deployed YYYY-MM-DD." Last-deployed is read at build
  time (already feasible with `process.env.VERCEL_GIT_COMMIT_SHA` or build
  date).

**Data:** `profile` for name + location.

**Mobile:** single column, generous spacing.

**Accessibility:**

- Footer is `<footer role="contentinfo">` — already correct.
- Links wrap properly at narrow widths.

**Risks:**

- Newsletter creep. There is no newsletter. Don't add a fake one.

**Don't custom-build:** anything new beyond the small colophon row.

---

## 17. Cross-Page Components Inventory

A consolidated list of new components the redesign needs, by location.

**`src/components/sections/`**

- `StatusPulseRow` — homepage now/shipping/writing strip.
- `WritingPulseRow` — newest post + newest devlog.
- `ClosingCTAStrip` — homepage closer.
- `CaseStudySection` — typed wrapper for problem/solution/etc.
- `PullQuoteBlock` — display-font quote.
- `NotFoundHero` — 404 wrapper.

**`src/components/cards/`**

- `GameCard` — games archive item.
- `ResourceRow` — resources list row.
- `ResourcePreviewCard` — homepage tools strip.
- `PostListItem` — blog timeline row.
- `PinnedPostCard` — pinned essay slot.

**`src/components/gallery/`**

- `GalleryBentoTile` — used homepage + gallery + collection.
- `CollectionFilterChips` — gallery filter row.
- `GalleryLightbox` — replaces inline dialog in current `_client.tsx`.
- `GalleryActions` — like/save/share/copy-link cluster.
- `GalleryRelatedRow` — 3 related thumbs in lightbox.
- `CollectionHero` — collection page cover overlay.

**`src/components/system/`**

- `CommandPalette` — Ctrl/Cmd-K palette.

**`src/components/layout/`**

- `CaseStudyFooter` — prev/next + back to archive (shared).
- `ColophonBar` — bottom of footer.

**`src/components/ui/magic/`** (Wave 2)

- Tokenized copies of `BentoGrid`, `BentoCard`, `BlurFade`, `BorderBeam`,
  `NumberTicker`, `ShimmerButton`, `AnimatedBeam`, `HeroVideoDialog`,
  `FileTree`, `AnimatedGridPattern`.

**`src/components/ui/origin/`** (Wave 3)

- Tokenized copies of `LikeButton`, `SaveButton`, `SharePopover`,
  `TagInput`, `ImageCarousel`.

**`src/components/ui/aceternity/`** (Wave 4)

- Tokenized copies of `Sparkles` (portal only) and one of
  `HeroSpotlight` / `LampEffect` (homepage hero, optional).

---

## 18. What Not to Custom-Build (Site-Wide Reminder)

- Modals, popovers, dropdowns, tabs, tooltips → Radix via shadcn.
- Forms with validation → shadcn `Form` + `react-hook-form` + `zod`
  (the codebase already has Zod for content; reuse for forms).
- Carousels → shadcn `Carousel` (Embla).
- Toasts → shadcn `Sonner`.
- Bento layouts → Magic UI `BentoGrid`.
- Number animations → Magic UI `NumberTicker`.
- Like / save / share buttons → Origin or 21st patterns, tokenized.
- Command palette → shadcn `Command`.
- File trees → Magic UI `FileTree`.
- Video dialogs → Magic UI `HeroVideoDialog`.

If a future PR rebuilds any of those from scratch, the burden is on that PR
to explain why the imported version was insufficient.

---

## 19. Accessibility Floor (All Pages)

- Skip-to-content link (`PageShell` already provides).
- Visible focus rings on all interactive elements (token: `--ring`).
- `prefers-reduced-motion` honored globally (already in `globals.css`).
- Color contrast ≥ 4.5:1 for body, ≥ 3:1 for display.
- Real `<button>`s and `<a>`s for actions and links — no clickable `<div>`s.
- All images have `alt`. Decorative images use `alt=""` and
  `aria-hidden="true"`.
- All forms have `<label>` (visible or `sr-only` when icon-only inputs are
  used).
- Locale switcher includes `lang` attributes per option.
- Dialogs trap focus and restore on close (Radix default — preserve when
  swapping to `Sheet` on mobile).

---

## 20. Implementation Order Reminder

Phase 1 build order across the routes above:

1. Homepage (§1).
2. Project Detail template (§6).
3. Projects archive polish (§5).
4. Gallery index + Lightbox (§2 + §3).
5. Collection page (§4).
6. 404 page (§14).
7. Header palette + footer colophon (§15 + §16).

Phase 2 picks up Blog, Games, Tools, About, Contact — each gets a tight pass
once the visual vocabulary from Phase 1 is locked.
