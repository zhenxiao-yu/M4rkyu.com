# m4rkyu.com — Working Backlog

> Impact-ordered, not date-bound. This is a **menu, not a mandate** — trim
> anything that smells try-hard. The goal is a warm, genuine **personal archive
> for friends/family** with a sharp editorial-engineer spine; it is *not* an
> Awwwards submission program, so "looks impressive" is never the reason to
> build something. Earn each addition (see `docs/COPY_VOICE.md` and the
> "not-cringe" bar).
>
> Workflow lives in `CLAUDE.md` → **Vibe-Coding Operating Loop** + the
> green/yellow/red zones. Don't duplicate it here.

Each ticket: **Goal · Why it matters · Where · Done-when.** A ticket is roughly
one coherent commit (or a short series). Reorder freely as reality lands.

---

## ✅ Shipped (don't re-open)

- **Hero** — minimal "wodniack" stage: cursor-reactive wave field +
  `Compile ✦ Compose` wordmark + binary marquees. Locked; do not re-add nav /
  keyword-cloud / ledger / preview-reel / backdrop-switcher clutter.
- **Home scroll** — continuous-scroll spine (`data-home-section`), retired the
  slide-snap.
- **Themes** — `risograph` / `terminal` / `editorial` × light/dark, no-FOUC
  bootstrap, ⌘K picker.
- **Blog reading** — editorial reading experience + TOC rail + page frame
  (first slice of "native writing").
- **Audio** — UI sound is reachable + contact-send cue wired (first cues only;
  full set is still open below).
- **SEO base** — canonical host, per-route metadata/hreflang, Person schema
  with `knowsLanguage`.

---

## 🔥 Now — high priority (the real gaps)

### H1 — Fill the empty content surfaces (photos + games)

- **Goal:** Gallery and games are *built but content-empty* — real photos,
  real game screenshots/clips, real captions. Ship the asset pipeline + at least
  2 fully-real gallery collections and de-stubbed games.
- **Why:** This is the **single highest-impact item for the friends/family
  goal** — non-technical visitors come for the photos and games, and right now
  there's nothing there. No copy or animation fixes this. *(Assets only the user
  can supply; the agent can build the pipeline, blur-data, EXIF, and honest
  empty-states for what's genuinely pending.)*
- **Where:** `src/content/{gallery,games,projects}.ts`, `ArchiveTile`, asset
  scripts (`exifr` installed), game covers, real project screenshots (replace
  placeholder SVGs).
- **Done-when:** ≥2 real collections live; games de-duped + real metadata;
  remaining gaps show an intentional empty-state, not a stub.

### H2 — Finish the warm copy layer

- **Goal:** Complete the "warm human layer" pass: hero intro lifted into the
  Compass section, friendlier ask-console chips, the renamed drafts section,
  per-project "why I made this" asides, `/notes` surfaced as the casual stream,
  Instagram in the footer (needs the handle).
- **Why:** A friend should get *who I am in ~10 seconds*. The Risograph
  editorial voice stays the spine — warm, not Gen-Z slang (fails the not-cringe
  bar). Mostly copy + small composition; low risk, high warmth.
- **Where:** `messages/{en,zh}.json`, Compass/home sections, project content,
  footer.
- **Done-when:** plain-language intro reads warm; EN/ZH parity; passes the
  `COPY_VOICE.md` §6 tone test; Instagram link live.

### H3 — Finish the UI sound set

- **Goal:** Complete the small cue payload (click / confirm / scene-enter /
  error) behind the existing toggle; wire to primary CTAs. Build on the audio
  work already shipped.
- **Why:** A site-specific "tell" that's genuine, not gimmicky — *if* it stays
  subtle. Off by default, reduced-motion aware, never autoplay.
- **Where:** `src/lib/audio/*`, `sound-toggle.tsx`, CTA buttons.
- **Done-when:** cues fire on intent, toggle persists, silent when off /
  reduced-motion; extend the existing audio unit test.

---

## 🟡 Next — when the above lands

### N1 — Native writing over dev.to coupling

- **Goal:** First-class local posts (markdown via the installed
  remark → rehype → shiki pipeline), dev.to demoted to secondary with correct
  canonical attribution. Builds on the shipped blog reading experience.
- **Where:** content/post pipeline, `logs` route, structured data.
- **Done-when:** a local post renders end-to-end; canonical correct; EN/ZH.

### N2 — One signature scroll moment

- **Goal:** Exactly *one* memorable, tasteful scroll beat (e.g. a single pinned
  reveal or hero→next beam) — not a scroll-jacked tour.
- **Why:** The line between "solid" and "memorable." One is the budget; more is
  cringe.
- **Done-when:** ≤800ms, reduced-motion fallback, no CLS regression.

### N3 — Quality pass: a11y + perf + SEO depth

- **Goal:** LCP/CLS/INP budgets, lazy-split heavy libs (GSAP/OGL/Leaflet), axe
  in Storybook, breadcrumbs + richer schema, resolve www/apex, real ZH content
  translation (not just chrome).
- **Where:** `next.config.ts` (Red — propose first), `.storybook/*`,
  `src/lib/seo/*`, `messages/*`, CI.
- **Done-when:** Lighthouse ≥95 mobile, budgets enforced, ZH content real.

---

## 🟢 Optional / opt-in — earn each one

These are real, buildable features — but **none is required for the
friends/family goal**, and several lean toward "impressive for its own sake."
Build one *only* when there's a concrete reason and it clears the not-cringe
bar. Do not wire any of these into a production surface just because it's listed
here or a component already exists.

- **AI portfolio concierge** — grounded RAG chat over `src/content` (AI SDK 6 +
  DeepSeek/Gateway). Genuinely useful *if* grounded + cited + refuses to invent;
  a gimmick otherwise. Security-review prompt-injection + key safety first.
- **Command console (⌘K v2)** — skinned cmdk: route jump, theme/locale, "ask"
  hand-off. Power-user nice-to-have; the basic ⌘K picker already exists.
- **Generative OG cards** — per-entity branded share cards (keep no
  `runtime="edge"`).
- **Live surfaces** — GitHub/now-building/status pulse, cached + graceful.
- **Interactive playgrounds** — showcase the in-browser resource tools.
- **Shop (Stripe end-to-end)** — only if there's something real to sell.
- **Comments / community**, **cross-device sync**, **admin CMS completion** —
  engineering-completeness items; pursue only when the content above is real and
  there's actual demand.

---

## Open decisions (settle before building the relevant ticket)

- **AI provider** (concierge) — DeepSeek direct vs. Vercel AI Gateway
  `provider/model` string; decide on cost/latency *if* the concierge is greenlit.
- **Instagram handle** (H2) — needed to wire the footer link.
