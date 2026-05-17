---
title: M4rkyu.com — Gallery Social Spec
status: SUPERSEDED — see docs/BACKEND_ARCHITECTURE.md
audience: implementation agents (Claude, Codex), reviewers
last_updated: 2026-05-16
---

# ⚠️ SUPERSEDED — DO NOT FOLLOW THE BODY OF THIS DOC

> **2026-05-16 — Doctrine update.** The anonymous-cookie identity model
> below has been **retired** by author decision. The new social layer
> is account-bound: real OAuth login (Google + GitHub) + email
> magic-link, user profiles, authenticated saves/bookmarks, and
> moderated comments — all backed by Supabase with row-level security.
>
> **Current source of truth:** [docs/BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).
>
> The body of this document is preserved for historical context only.
> Specific rules below that are **explicitly retired**:
>
> - §5 _Likes UI_ — anonymous likes feature **dropped**. No
>   replacement; "save" covers the same intent for signed-in users.
> - §6 _Comments UI_ — anonymous comments **retired**; comments now
>   require sign-in. The "Forbidden: Login walls" line below is no
>   longer policy.
> - §7 _Save / Favorite_ — visitor-cookie identity **retired**; saves
>   are keyed on `auth.users.id` and persisted in Supabase. The
>   localStorage path becomes a one-time migration helper for visitors
>   who already saved frames before the auth system landed.
> - §13 _Future Backend Boundary_ + §14 _Backend Options_ — the
>   Upstash KV recommendation is **retired** in favor of Supabase as
>   the single backend for auth + saves + comments + admin.
> - §15 _Anti-Spam_ — cookie-keyed rate limits **retired**; auth is
>   the new rate gate, with Postgres-level per-user limits if abuse
>   appears.
> - §17 _Admin Controls_ — env-secret bearer-token admin **retired**;
>   admin access is now gated by `profiles.role = 'admin'` enforced by
>   RLS.
>
> The vocabulary (frames, collections, captions) and the **§18 "no
> fake engagement" rule** still apply.

---

## Original document (historical)

> **Status as of 2026-05-10**: visitor-local social MVP shipped
> (Phase 1) — likes, saves, share via `src/lib/social/*`. Backed by
> `localStorage` with a `useSyncExternalStore` channel; the lib
> boundary is swap-ready for KV (Sprint 6.A) when the user provides
> Upstash / Vercel KV secrets. Saved frames page lives at
> `/<locale>/gallery/saved` and is `noindex` per Phase 5.1. UI:
> Like / Save / Share affordances ship on every gallery frame.

The gallery is the most public-facing surface on the site — the page most
likely to get DM'd, reposted, and bookmarked. This document defines its
**social layer**: how visitors interact with frames and collections without
the page ever pretending to be Instagram.

The gallery is **VSCO-inspired**, not a VSCO clone. The vocabulary is
_frames_, _collections_, and _captions_ — never _feeds_, _followers_, or
_streaks_.

> **Hard floor for everything below:** no fabricated engagement. No
> hand-coded "likes: 247." No fake comments. No fake users. If a number
> isn't backed by a real database event, it doesn't render.

---

## 1. Core Vocabulary

| Term           | Meaning                                                       |
| -------------- | ------------------------------------------------------------- |
| **Frame**      | A single gallery item. Image, contact sheet, or process scan. |
| **Collection** | A curated body of work (e.g. "Black & White").                |
| **Caption**    | Editorial copy beside or under a frame. Author-only.          |
| **Tag**        | Lowercase descriptor on a frame. Free-form, curated.          |
| **Mood**       | Higher-level grouping (e.g. `quiet`, `kinetic`, `archive`).   |
| **Featured**   | Author-pinned status that surfaces a frame to the top.        |
| **Save**       | Visitor-only action: add to local "saved frames" list.        |
| **Like**       | Visitor-only action: increment a public counter on a frame.   |
| **Share**      | Visitor action: generate a deep link `?frame=<slug>`.         |

Likes and saves are visitor actions; everything else is author-controlled.

---

## 2. Collection Model

Already defined in [src/content/schemas.ts](../src/content/schemas.ts) as
`galleryCollectionSchema`. Phase 1 extends it with a few optional fields:

```ts
const galleryCollectionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  cover: imageSchema.extend({
    focal: z.enum(["top", "center", "bottom"]).default("center"),
  }),
  count: z.number(),
  status: contentStatusSchema.default("placeholder"),

  // Phase 1 additions
  intro: z.string().optional(), // Long-form curatorial note (collection page)
  startDate: z.string().optional(), // ISO date — earliest frame
  endDate: z.string().optional(), // ISO date — latest frame
  mood: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
});
```

**Rules:**

- A collection is the only way frames are organized. There is no
  follow-the-feed surface.
- A frame belongs to **exactly one** collection (Phase 1). Cross-collection
  membership is a Phase 2 feature.
- `cover.focal` controls cropping on the collection hero (see
  [COMPONENT_MAP.md](./COMPONENT_MAP.md) §4).
- `count` is computed at build time from `galleryItems`, not hand-typed,
  by Phase 2. Phase 1 keeps the manual field for compatibility with the
  current content layer.

---

## 3. Gallery Post Model

Today's `galleryItemSchema` covers the basics. Phase 1 extends it:

```ts
const galleryItemSchema = z.object({
  title: z.string(),
  slug: z.string(),
  collection: z.string(),
  type: z.enum(["image", "contact-sheet", "process"]),
  status: contentStatusSchema,
  caption: z.string(),

  // Phase 1 additions
  src: imageSchema.optional(), // Real image. Falls back to placeholder.
  aspect: z.enum(["1/1", "4/5", "3/4", "2/3", "16/9", "21/9"]).default("4/5"),
  capturedAt: z.string().optional(), // ISO date
  location: z.string().optional(), // City / region — never an address
  tags: z.array(z.string()).default([]),
  mood: z.array(z.string()).default([]),
  featured: z.boolean().default(false), // Author-pinned to top of grid
  pinned: z.boolean().default(false), // One-frame-of-the-month slot
  related: z.array(z.string()).default([]), // Slugs of related frames
});
```

**Rules:**

- `caption` is editorial. It can be a single sentence, a quote, or empty.
- `tags` are lowercase, hyphenated, free-form. We curate the list — no
  visitor tag input in Phase 1.
- `location` is **city or region only**. Never a street, never a venue
  with private address details.
- `featured` surfaces the frame to the top of its collection.
- `pinned` is exclusive — at most one pinned frame across the entire
  gallery at a time. Validate at build time.
- `related[]` is curated. If empty, the lightbox falls back to "more from
  this collection."

---

## 4. Image Detail Modal / Page

Detail behavior lives in the lightbox modal. The current implementation
([gallery/\_client.tsx](../src/app/[locale]/gallery/_client.tsx)) is the
right starting shape — Phase 1 polishes it.

**Open behavior:**

- Click on a tile → set `?frame=<slug>` in the URL (already implemented).
- Modal opens, focus trapped (Radix `Dialog`).
- Body scroll locked; background dimmed.

**Modal structure (top → bottom):**

1. **Top bar** — close · counter (`12 / 48`) · share · save.
2. **Image** — full-width, fitted to viewport. Pinch-zoom on touch.
3. **Meta row** — title (display) · collection chip · location · captured
   date.
4. **Caption** — short editorial text.
5. **Tag row** — lowercase chip cluster.
6. **Action row** — like (count) · save · share · copy-link.
7. **Prev / Next** controls — arrow keys, swipe gestures, on-screen buttons.
8. **Related row** — 3 thumbnails (`related[]` first, then collection-mates).

**Mobile:**

- On `<md`: a `Sheet` from the bottom replaces the centered `Dialog`.
- Image fills width. Caption + actions stack underneath.
- Tap-and-hold reveals download/copy options _only if_ the frame is licensed
  for redistribution (Phase 2 — see §13).

**Deep-link sharing:**

- `?frame=<slug>` is the canonical share URL.
- Visit-by-deep-link: page should render the gallery underneath, modal
  open, scroll position preserved on close.
- Open Graph: each gallery item gets a unique OG image (Phase 2 generates
  per-frame OG via `next/og`).

---

## 5. Likes UI

A small, quiet affordance. Not a heart that pulses. Not a counter that
"+1" animates aggressively.

**Visual:**

- An icon button with the `lucide-react` `Heart` icon.
- Resting state: outline.
- Liked state (current visitor liked this frame): solid + tinted
  `var(--signal)`.
- Count text appears to the right _only when count > 0_.
- One-line tooltip via shadcn `Tooltip`: `Like` (resting) /
  `Liked` (active).

**Interaction:**

- Tap → optimistic UI flips state and increments the local count by 1.
- A debounced request commits the change to the backend.
- Failure → revert state + a `Sonner` toast: "Couldn't save your like —
  try again."
- Anonymous-only (no login). Visitor identity = a stable cookie ID
  (`m4_visitor`, set on first like or save).
- Per-visitor rate limit: see §15.

**Numbers display:**

- 0 → no count visible (just the icon).
- 1–9999 → exact count.
- ≥ 10,000 → `10k`, `12k`, `1.2M` (very unlikely on this site, but cover
  the case).
- Animate count change with Magic UI `NumberTicker`, but only on the
  detail modal — never on grid tiles.

**Where it appears:**

- Lightbox action row (primary).
- Tile overlay on hover (desktop only) — tiny, lower-right corner. Mobile
  tiles do **not** show like UI; the only way to like is to open the
  frame.

**No like UI on:**

- Collection cards.
- Project cards.
- Game cards.
- Blog post cards.

Likes are a gallery-only social action. Other archives stay quiet.

---

## 6. Comments UI (Phase 2)

Comments are **not** in the Phase 1 MVP. When they ship in Phase 2:

**Visual:**

- A `CommentThread` component (sourced from 21st.dev pattern, tokenized).
- Lives below the action row in the lightbox, collapsed by default
  (`Show comments (4)`).
- Each comment: author display name (1–24 chars, validated), body
  (1–500 chars), relative timestamp.
- No avatars in v1 of comments — names only, monospace, indented.

**Interaction:**

- Anonymous post with a display-name field (free-form, validated).
- Honeypot field + server rate limit (see §15).
- Comments are **moderated**: posts enter a `pending` state and require
  author approval before becoming visible (see §10).
- Reply depth: flat. No nested threads.
- Edit / delete by visitor: not supported; visitors can flag, author can
  delete.

**Display rules:**

- Comments load lazily — no fetch on grid view, only when the thread is
  expanded in the lightbox.
- Sorting: chronological, oldest first.
- Cap to 100 displayed; older move to "show all" pagination.

**Forbidden:**

- Login walls.
- Public reactions on comments.
- "Pin author response" UI in v1.

---

## 7. Save / Favorite UI

A visitor-only "saved frames" list, persisted locally and (Phase 2)
synced to a backend by visitor cookie ID.

**Visual:**

- `Bookmark` icon button next to the like button.
- Resting: outline.
- Saved: solid, no tint (a quiet differentiator from like).

**Interaction:**

- Tap → toggle save state.
- Saved frames can be reviewed at `/[locale]/gallery/saved`. This is a
  visitor-private route — frames render based on local storage. There is
  no public "saves count" anywhere.

**Local-first:**

- Phase 1 uses `localStorage` only. No backend write.
- Storage key: `m4_saved_frames` (array of slugs).
- Cap: 200 frames per visitor; oldest removed when exceeded.

**Phase 2:**

- Optional sync to backend keyed on visitor cookie ID.
- Saved set survives device changes if visitor opts into a recovery code.

**Forbidden:**

- Public count of saves on a frame.
- "Most saved this week" leaderboards.
- Notification when a frame is saved by N visitors.

---

## 8. Share / Copy-Link UI

The most important social action — most visitors share before they like.

**Visual:**

- `Share2` icon button → opens a shadcn `Popover`.
- Popover contains:
  1. **Copy link** (default action, big button).
  2. **Open in new tab.**
  3. **Native share** (mobile) — falls back to copy-link if
     `navigator.share` is unavailable.
  4. Optional: direct to **X / Bluesky / Threads** with prefilled text
     (only if those handles are real and provided in `profile`).

**Behavior:**

- "Copy link" places `${origin}/${locale}/gallery?frame=${slug}` on the
  clipboard and triggers a `Sonner` toast: `Link copied`.
- Native share on mobile uses `navigator.share({ title, text, url })` with
  the frame title and caption.
- No analytics ping on share unless explicitly wired (no opaque tracking).

**Forbidden:**

- Pre-filled tweets that include hashtags the author hasn't approved.
- "Share count" public metric.
- Automatic redirect to a third-party service.

---

## 9. Tags / Moods

Free-form, lowercase, curated by the author.

**Visual:**

- Tag chip = `Badge` variant outline. Lowercase, mono.
- Mood chip = `Badge` variant signal. Limited to a small vocabulary
  (`quiet`, `kinetic`, `archive`, `lab`, `field`, `studio` — extend
  intentionally).

**Behavior:**

- Tag chips are clickable and route to
  `/gallery?tag=<value>` (filters grid).
- Mood chips route to `/gallery?mood=<value>`.
- Filters compose via URL params: `?tag=street&mood=quiet`.

**Forbidden:**

- Visitor-supplied tags in Phase 1.
- Tag clouds in the footer.
- Auto-tagging via ML — every tag is author-typed.

---

## 10. Pinned / Featured Posts

Two distinct mechanics.

**Featured (`featured: true`):**

- Floats to the top of its collection grid.
- Multiple frames can be featured per collection (cap at ~5 to avoid
  flattening the curatorial signal).
- No special visual on the tile — featured frames just appear earlier.

**Pinned (`pinned: true`):**

- Site-wide; **at most one** at any given time.
- Renders in a hero band on `/gallery` above the chip filter.
- Visual: large hero with caption + "Pinned frame" mono eyebrow.
- Validated at build time (Zod refinement: `pinned: true` count ≤ 1).

**Forbidden:**

- Visitor-driven pinning.
- "Trending" or "rising" surfaces — those imply velocity tracking we
  haven't earned.

---

## 11. Related Posts

Lives at the bottom of the lightbox modal.

**Algorithm:**

1. If `frame.related[]` is non-empty, use those slugs in order.
2. Otherwise, fall back to other frames in the same collection, ordered by
   `capturedAt desc`.
3. Cap at 3.

**Visual:**

- 3 small thumbnails (square aspect), title underneath.
- Click swaps the lightbox content (no modal close + reopen).
- "From this collection" / "Related" mono eyebrow above the row.

**Forbidden:**

- ML-driven recommendations in Phase 1.
- Cross-domain "related from blog" — keep gallery related to gallery.

---

## 12. View Count Strategy

Likes and saves are _active_ engagement. Views are _passive_ — and the
easiest metric to fake. Phase 1 ships **without a public view count.**

Phase 2 may introduce a private analytics dashboard for the author. Public
view counts remain off until there's a clear creative reason to show them
(none yet).

**If view counts ever ship:**

- Server-side increment on lightbox open, deduplicated by visitor cookie
  ID + 1-hour window.
- Bot filtering via UA heuristic + IP-rate gate.
- Display only when count ≥ 50 (avoid the "5 views" bad-feeling).

---

## 13. Future Backend Boundary

Phase 1 social features are **partially client-only**:

| Feature  | Phase 1 storage              | Phase 2 storage             |
| -------- | ---------------------------- | --------------------------- |
| Likes    | Backend (counters)           | Same                        |
| Saves    | `localStorage` only          | Backend, keyed on cookie ID |
| Share    | Client only (no persistence) | Same                        |
| Comments | Not shipped                  | Backend with moderation     |
| Views    | Not shipped                  | Backend (private dashboard) |

This means **a backend is required for likes from day one of the social
MVP**. Saves can ship purely client-side; comments are deferred entirely.

**API contract (illustrative, not prescriptive):**

```
POST /api/gallery/like
Body: { frameSlug: string, action: "add" | "remove" }
Returns: { count: number, liked: boolean }
```

```
GET /api/gallery/likes
Query: ?slugs=a,b,c
Returns: { [slug]: number }
```

The visitor's liked state is **client-side memoized** — no per-visitor
`likes` index in the backend. Visitors are anonymous. The backend stores
_counts_ and _rate-limit windows_, not identities.

---

## 14. Backend Options

Pick **one** for Phase 1. The site is on Vercel; the backend should match.

| Option                 | Why this fits                                                    | Why it doesn't                          |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| **Upstash Redis**      | Tiny counters, atomic INCR, free tier covers this scale.         | No relational story for comments later. |
| **Supabase**           | Postgres + RLS for comments later, real-time channels available. | Heavier than likes need on day one.     |
| **Vercel KV**          | First-party, INCR-friendly, identical to Upstash under the hood. | Same comment-story limitation.          |
| **Cloudflare D1**      | SQL with global edge writes.                                     | Less Vercel-native than the others.     |
| **PlanetScale / Neon** | Serverless Postgres — comments-ready.                            | Overkill for likes-only Phase 1.        |

**Recommendation:** **Upstash Redis (or Vercel KV)** for Phase 1 likes; add
**Supabase** in Phase 2 when comments land. The redirection cost is one
backend module; counts can be migrated by a single `MGET` → SQL load.

The chosen backend lives behind a single module: `src/lib/social/likes.ts`.
Page code talks to that module, never to the backend SDK directly.

---

## 15. Anti-Spam, Rate Limiting, Abuse

The minute likes ship publicly, somebody will write a script. Plan for it.

**Likes:**

- Server-enforced rate limit: **20 likes/minute per visitor cookie ID**,
  **120 likes/hour per IP**, **3 likes/sec burst.**
- Implement via Upstash `@upstash/ratelimit` if Upstash; Postgres + window
  function if Supabase.
- Likes from the same cookie ID on the same frame are idempotent (toggle,
  not increment).
- Bot UA heuristic: blocked UAs (`curl`, `python-requests`, headless
  fingerprints) are silently 200'd but never persisted.

**Saves:**

- Client-only in Phase 1 — no rate limit needed.

**Comments (Phase 2):**

- Hard limits: **5 comments/hour per visitor cookie**, **20/hour per IP.**
- Honeypot field on form.
- Server-side profanity filter (a small wordlist, not an LLM).
- Manual approval queue — comments don't display until the author reviews.
- Optional: invisible reCAPTCHA v3 _only if_ abuse becomes real. Skip until
  needed.

**Share:**

- No backend involvement; can't rate-limit a `clipboard.writeText`. Don't
  try.

**General:**

- All write endpoints behind CSRF protection (Vercel's `next-safe-action`
  or hand-rolled token in cookie).
- All cross-origin write requests rejected.

---

## 16. Moderation Requirements

Even on a personal site, moderation matters.

**Author tools (Phase 2 admin route — not Phase 1):**

- Approve / reject comment.
- Soft-delete with reason (kept for audit, hidden publicly).
- Block a cookie ID + IP combo (silently 401 their writes).
- Reset like count for a frame (in case of a brigading event).

**Public-facing:**

- "Report" link next to each comment (Phase 2). Sends an email to the
  author with cookie ID + comment text + frame slug.
- Author-removed content shows `[removed]` placeholder, not a deleted row.

**Logging:**

- All write events logged (visitor cookie ID, IP, action, timestamp,
  result). Logs auto-rotate after 90 days.
- Logs are **not** public. Privacy posture: visitor ID is opaque, IPs are
  not surfaced in any UI.

---

## 17. Admin Controls (Phase 2)

A `/[locale]/admin/gallery` route, gated by env-secret bearer token (no
public login). Capabilities:

- See like counts per frame, sorted desc.
- See pending comments, approve/reject.
- See save counts (aggregate, anonymous).
- See blocked cookie IDs / IPs.
- Reset a frame's counters.

Phase 1 has no admin route. Counters live in the chosen KV; the author can
inspect via the Upstash / Vercel KV dashboard until the admin UI ships.

---

## 18. No Fake Engagement Rule

Repeated for emphasis — this rule supersedes everything else in this doc.

- Counters render only when a real backend event exists.
- Empty counters render nothing (no `0` placeholder, no "Be the first to
  like" microcopy).
- Phantom comments (i.e. seeded "demo" comments) are forbidden. The
  comment section is empty until a real visitor posts.
- Phantom users are forbidden. There are no avatars, names, or testimonial
  quotes attributed to fictional visitors anywhere on the site.
- Like-count animations on idle (drifting up by 1 every minute "for life")
  are forbidden.
- Demo / Storybook fixtures may show invented counts for visual review,
  but those fixtures must never reach a live route.

A future PR that violates this rule should be rejected at review without
discussion.

---

## 19. Accessibility Requirements

- Like, save, and share buttons all have:
  - Real `<button>` elements.
  - `aria-label` ("Like this frame," "Save," "Share").
  - Visible focus rings on `--ring`.
  - State announcement on toggle (`aria-pressed`).
- Like-count changes announce via `aria-live="polite"` on the count
  element.
- Toast notifications use `Sonner` which is screen-reader-aware.
- All chips (tags, moods) are real `<button>` or `<a>` elements depending
  on whether they navigate.
- Lightbox traps focus, Escape closes, Tab cycles within (Radix default).
- Carousel inside lightbox supports arrow keys and `Home`/`End`.
- Pinch-zoom on touch never blocks dismissal — single-tap on the dim
  background still closes the modal.
- Reduced motion: like animation collapses to instant state change.

---

## 20. Mobile Requirements

- The gallery is mobile-first. Every social affordance must look right at
  390px before it earns desktop polish.
- Tile grid: 2 cols at `<sm`, 3 at `md`, 4 at `lg`.
- Lightbox: bottom-sheet on `<md`, centered dialog on `≥md`.
- Like + save + share buttons sit in a single bottom-fixed action bar
  inside the bottom-sheet variant (thumb-zone friendly).
- Action buttons are at minimum 44 × 44px touch targets.
- Swipe-left / swipe-right navigates frames (Embla handles this).
- Tap-and-hold on a tile shows a `Sheet` with quick actions (open, save,
  share) — Phase 2 enhancement.

---

## 21. MVP Phase (Phase 1)

Ship in this order. Each step lands behind a flag if needed; the gallery
keeps working even with social removed.

1. **Schema extensions** (§3) — extend `galleryItemSchema`. Update content
   in `src/content/gallery.ts` to include real `src`, `aspect`, and tags
   for all `status: "ready"` frames.
2. **Lightbox refactor** (`GalleryLightbox`) — replaces inline dialog,
   carries the new structure (counter, meta, actions, related).
3. **Likes backend** — pick Upstash KV. Implement
   `src/lib/social/likes.ts` with `getCounts`, `like`, `unlike`. Add
   rate-limit middleware.
4. **Likes UI** — `GalleryActions` cluster with the like button only;
   save and share follow next.
5. **Saves UI** — local-only, `localStorage`-backed.
6. **Share UI** — popover with copy-link + native share fallback.
7. **Tags + moods** — chip clusters and URL-param filters on the gallery
   index.
8. **Pinned / featured** — author-side toggles in content; build-time
   validation.
9. **Saved frames page** — `/gallery/saved`, hydrates from local storage,
   gracefully empty.
10. **Open Graph cards** — per-frame OG via `next/og`.

Phase 1 acceptance: a visitor can browse, filter, like, save, and share —
without seeing a fake number anywhere.

---

## 22. Future Phase (Phase 2 and Beyond)

- Comments with moderation queue and admin route.
- Saves synced to backend by visitor cookie ID.
- Visitor recovery code for cross-device save sync.
- Optional newsletter (only if there's something real to send).
- Per-frame OG generation pipeline upgrades (auto-extract dominant
  color for OG background).
- Author-side admin route at `/admin/gallery`.
- View-count private dashboard.
- Cross-collection frame membership.
- "On this day" memory surface (frames captured this week, last year).
- Optional integration: ATProto / Bluesky cross-post when a frame goes
  pinned.

Each item in Phase 2 is a separate decision. None is committed by Phase 1.

---

## 23. Open Questions (Not Decisions)

These are flagged for the author. Future agents should not invent
answers — surface the question and wait.

1. **Identity model for likes.** Cookie-only is the Phase 1 default. Is
   there a future requirement to support email-based recovery? If yes, it
   affects schema design now.
2. **Comment policy.** Will comments be open globally, or per-collection?
   Per-frame opt-in?
3. **Newsletter.** Is there one? If not, the closing CTA should never
   include a "subscribe" affordance.
4. **Bluesky / ATProto.** Will frames cross-post automatically? Affects
   whether we generate OG cards eagerly or on-demand.
5. **Featured cap.** Hard cap of 5 featured frames per collection — does
   that match the curatorial intent?

---

## 24. Companion Documents

- [REDESIGN_DIRECTION.md](./REDESIGN_DIRECTION.md) — overall creative
  direction.
- [UI_LIBRARY_STRATEGY.md](./UI_LIBRARY_STRATEGY.md) — what to install for
  the social pieces (Origin / 21st patterns).
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) — where every component lives.

The social layer is the most opinionated part of the redesign. When in
doubt, lean toward less, lean toward quieter, and never lean toward
fabricated.
