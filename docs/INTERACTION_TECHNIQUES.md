---
title: M4rkyu.com — Advanced Interaction Techniques
status: living
audience: implementation agents (Claude, Codex), reviewers
last_updated: 2026-05-11
companion: docs/FINAL_SITE_ARCHITECTURE.md, docs/UNIFIED_VISUAL_DIRECTION.md
---

# Advanced Interaction Techniques

Craft tools, not decoration. Each technique below has a narrow,
documented use. Anything outside the "Allowed pages" row needs an
explicit PR-level justification.

Every entry follows the same shape:

```
Use for           — green-light cases
Do not use for    — forbidden cases
Mobile fallback   — what happens at <768px / touch
Reduced motion    — what happens with prefers-reduced-motion: reduce
A11y notes        — semantics, focus, SR behavior
Performance risk  — what can go wrong + the cap
Allowed pages     — exact routes the technique may appear on
```

The companion rules in [FINAL_SITE_ARCHITECTURE.md §8](./FINAL_SITE_ARCHITECTURE.md#8-motion-system)
still apply (one atmospheric effect per viewport, design-token easing,
no GSAP/Three.js without a separate PR).

---

## 1. Scroll Tracking

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Homepage boot-sequence progress · work-detail reading progress · archive section state. |
| Do not use for   | Scroll-jacking (preventing the user from scrolling at their own pace).  |
| Mobile fallback  | Keep. Use passive scroll listeners + `requestAnimationFrame` throttling. |
| Reduced motion   | Render the final state immediately; skip the progress animation.        |
| A11y notes       | Progress indicators expose `role="progressbar"` + `aria-valuenow/min/max`, or use `aria-live="polite"` for status. Never trap focus. |
| Performance risk | Cheap when passive + rAF-throttled. Becomes expensive if scroll handlers read `offsetTop` / `getBoundingClientRect` per frame — cache once and update on resize. |
| Allowed pages    | `/[locale]` (boot sequence) · `/[locale]/work/[slug]` (reading progress) · `/[locale]/archive` (section state). |

---

## 2. Viewport Detection

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Section reveal · lazy animation start · image / contact-sheet reveal · performance gating (defer expensive work until visible). |
| Do not use for   | Animating offscreen elements.                                           |
| Mobile fallback  | Same. `IntersectionObserver` is touch-safe.                             |
| Reduced motion   | Trigger content/visibility immediately. Skip the motion that the trigger would have driven. |
| A11y notes       | Never hide content from assistive tech. Observe to gate animation, not to gate content existence. Content must be in the accessibility tree before the reveal fires. |
| Performance risk | Cheap when one shared observer is reused. Expensive when each element instantiates its own observer. Prefer `threshold: 0` + `rootMargin` over many thresholds. |
| Allowed pages    | All routes — foundational technique.                                    |

---

## 3. Sticky Position

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Compact header · work filters · work-detail metadata / table of contents · logs article table of contents · archive filters. |
| Do not use for   | Covering content on mobile.                                             |
| Mobile fallback  | Demote sticky stacks to a single sticky bar, or drop sticky entirely. Never stack two sticky elements on narrow viewports. |
| Reduced motion   | N/A — sticky is layout, not motion.                                     |
| A11y notes       | Keep keyboard focus visible — focus rings must not be obscured by sticky surfaces. Sticky landmarks need `aria-label` (e.g. `<nav aria-label="Sections">`). Provide a skip-link past sticky headers. |
| Performance risk | Cheap. Watch for `position: sticky` silently breaking inside an `overflow: hidden` ancestor — audit during implementation. |
| Allowed pages    | Header (all routes) · `/[locale]/work` filter bar · `/[locale]/work/[slug]` metadata + ToC · `/[locale]/logs/[slug]` ToC · `/[locale]/archive` filters. |

---

## 4. Easing

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | All motion, via design tokens: `--motion-micro`, `--motion-fast`, `--motion-medium`, `--motion-slow`, `--motion-cinematic`, `--ease-premium`. |
| Do not use for   | Random one-off easing curves unless an inline comment justifies why no token fits. |
| Mobile fallback  | Same tokens — they are responsive-agnostic.                             |
| Reduced motion   | Tokens collapse to 1ms via the global `prefers-reduced-motion` override. |
| A11y notes       | N/A.                                                                    |
| Performance risk | N/A.                                                                    |
| Allowed pages    | All routes.                                                             |

---

## 5. Text Splitting

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Homepage hero headline. Optionally **one** section title elsewhere.     |
| Do not use for   | Body text · article text · Chinese paragraphs · long subtitles.         |
| Mobile fallback  | Keep on hero. Cap total reveal duration ≤ 800ms so it never feels slow on phones. |
| Reduced motion   | Render the full string instantly. No split, no per-character delay.     |
| A11y notes       | The wrapper element carries the full string via `aria-label`. Split children get `aria-hidden="true"` so screen readers read the headline once, not character-by-character. |
| Performance risk | Layout cost grows with character count. Never split strings > 40 characters. Avoid on Chinese — CJK measurement is more expensive *and* the effect reads as gimmicky in zh. |
| Allowed pages    | `/[locale]` hero only (EN). Optionally one `/[locale]/work/[slug]` title (EN), case-by-case. Never on `/zh`. |

---

## 6. Map Range

Mapping scroll progress (or pointer position) through a clamped range
onto a visual property.

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Opacity · small `y` movement · subtle scale · progress bars.            |
| Do not use for   | Parallax > 24px on any axis.                                            |
| Mobile fallback  | Halve the output range, or disable. Movement that feels subtle on desktop reads as juddery on touch. |
| Reduced motion   | Snap to the end-state value; do not map progressively.                  |
| A11y notes       | Decorative only — mapped properties must never carry meaning that AT users would otherwise miss. |
| Performance risk | Cheap when mapped to `transform` / `opacity`. Expensive if mapped to layout-affecting properties (width, height, top) — never do that. |
| Allowed pages    | `/[locale]` HUD strip · `/[locale]/work/[slug]` reading progress · `/[locale]/archive` section reveal. |

---

## 7. Lerp

Linear interpolation toward a target each frame — used for "smoothed"
pointer follow and hover response.

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | Subtle pointer-follow highlight · command-panel hover response · one premium cursor-adjacent effect on desktop only. |
| Do not use for   | Touch devices.                                                          |
| Mobile fallback  | Hard-disable. Gate behind `@media (hover: hover) and (pointer: fine)`. Touch fires synthetic mouse events on some browsers — feature-detect, do not assume. |
| Reduced motion   | Skip the lerp loop; snap directly to the target on each event.          |
| A11y notes       | Lerp effects must not interfere with keyboard focus indicators or hover-triggered tooltips. The lerp is decoration on top of normal hover state, not a replacement for it. |
| Performance risk | One rAF loop per active lerp + transform writes per frame. Keep at most **one** active lerp loop site-wide. Stop the loop when the source element is unmounted or offscreen. |
| Allowed pages    | `/[locale]` CommandHero pointer highlight · Cmd-K command palette hover. |

---

## 8. Shader

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Use for          | `/[locale]/portal` only. Optionally one experimental hero/preview if separately approved in its own PR. |
| Do not use for   | Main pages during the architecture phase. No Three.js / WebGL dependency added without a separate justification PR. |
| Mobile fallback  | Feature-detect WebGL2. Fall back to a static image or canvas-2D version. Never block main content on shader compile. |
| Reduced motion   | Render the static fallback. Do not run the shader.                      |
| A11y notes       | Shader output is decorative. Provide a non-shader path to any information the shader visualizes. Do not gate navigation behind a shader interaction. |
| Performance risk | High. Lazy-load shader code via dynamic import. Gate init behind viewport observer (§2). Tear down on route change. Budget: shader bundle ≤ 40KB gzipped, init ≤ 100ms on mid-range mobile. |
| Allowed pages    | `/[locale]/portal` only.                                                |

---

## 9. Cross-cutting rules

These apply to every technique above.

- **One signature moment per viewport** — combining lerp + shader +
  text-splitting + map-range on the same screen is *always* over-budget.
  Pick one.
- **Token-driven** — every duration, easing, and motion value comes
  from a design token. Inline magic numbers need a comment explaining
  why no token fits.
- **Reduced-motion is non-negotiable** — every technique ships its
  reduced-motion fallback in the same PR. No "follow-up cleanup".
- **Mobile fallback in the same PR** — if it doesn't work on a phone,
  it doesn't ship.
- **A11y in the same PR** — semantics, focus order, SR behavior are
  acceptance criteria, not optional.

---

## 10. Where this fits in the roadmap

These techniques land alongside their consuming PRs in
[FINAL_SITE_ARCHITECTURE.md §12](./FINAL_SITE_ARCHITECTURE.md#12-pr-roadmap):

| Technique                | First lands in                              |
| ------------------------ | ------------------------------------------- |
| Scroll Tracking          | #60 (home boot) · #62 (work detail reading) · #63 (archive) |
| Viewport Detection       | Already in use via BlurFade; expanded in #61 |
| Sticky Position          | #58 (header) · #62 (work filters + metadata) · #64 (logs ToC) |
| Easing tokens            | Already in use; enforced in #57 token audit |
| Text Splitting           | #60 (home hero only)                        |
| Map Range                | #60 (HUD strip) · #62 (reading progress)    |
| Lerp                     | #60 (CommandHero pointer) · #67 (Cmd-K)     |
| Shader                   | Not before /portal redesign — no PR yet     |

If a technique appears in an earlier PR than this table allows, the
reviewer should reject it or request the scope be moved.
