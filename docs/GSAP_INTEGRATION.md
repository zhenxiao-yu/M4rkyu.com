# GSAP integration

Scoped integration of GSAP alongside the existing `motion/react`
animation system. GSAP is **not** a replacement for motion/react —
the two coexist with strict rules about which to reach for, and a
hard "one signature surface per page" cap.

## What landed

- `gsap@3.15.0` and `@gsap/react@2.1.2` added to dependencies.
  GSAP became free for commercial use after the Webflow acquisition;
  no license layer to manage.
- `src/lib/gsap.ts` — central plugin registration (SplitText only),
  shared `motionTokens` mirroring CSS `--motion-*` / `--ease-*`,
  plus a `prefersReducedMotion()` helper.
  - **ScrollTrigger is intentionally NOT registered.** Add it back
    only when shipping a surface that genuinely needs scroll-pinning
    (~25 KB cost lands the moment registration happens).
- `src/components/sections/split-headline.tsx` — char-staggered
  reveal of the EN hero headline via `SplitText`. Handles multi-line
  wrapping with a clip mask correctly (the prior motion/react
  word-stagger couldn't).
- `src/components/sections/hero-boot-sequence.tsx` — single timeline
  that orchestrates the entire home hero as one cinematic sequence:
  eyebrow → headline (parallel SplitHeadline) → subtitle → CTA row
  (stagger) → CommandHero panel → HUD strip. Picks up its elements
  by `data-boot="..."` attribute so the children stay
  server-rendered.

That's the entire surface. Nothing else uses GSAP.

## Where GSAP earns its weight (and where it doesn't)

Use GSAP for things that are hard to do cleanly with CSS / motion/react:

```
✓ Home boot-sequence hero          (shipped)
✓ Stacked headline reveal          (shipped)
✓ Scroll-linked signature section  (future, add ScrollTrigger)
✓ Pinned case-study moment         (future, mobile-tested only)
✓ Terminal intro sequence          (future)
✓ Portal easter egg                (future)
```

Do **not** use GSAP for:

```
✗ button hover
✗ badge hover
✗ simple card fade
✗ modal open
✗ mobile menu
✗ form fields
✗ article body
✗ every section reveal
```

Those stay on CSS / Tailwind / motion/react / shadcn-Radix.

## Performance-safe rules

Treat these as non-negotiable. Slow GSAP sites come from violating
them, not from GSAP itself.

1. **One GSAP signature moment per page, maximum.**
2. **No GSAP in the global layout.** Routes that don't use a
   GSAP-driven surface must not pay for it.
3. **No ScrollTrigger on every card.** ScrollTrigger is for
   page-scale moments, not for-each animations.
4. **No pinned sections on mobile** unless explicitly tested and
   the interaction degrades gracefully.
5. **Animate `transform` and `opacity` only** when possible.
   `x`, `y`, `scale`, `rotate`, `opacity` — yes.
6. **Avoid animating `width`, `height`, `top`, `left`, `filter`,
   `blur`, `box-shadow`.** Those are paint-thrashing.
7. **Respect `prefers-reduced-motion`.** Short-circuit the timeline
   setup. The final state must render correctly without GSAP doing
   anything.
8. **Kill / revert animations on unmount.** `useGSAP` handles this
   automatically — use it. Manual `gsap.context` is more error-prone.
9. **Lazy-load GSAP-heavy sections** when they live below the fold.
   Use `next/dynamic({ ssr: false })` for the surface, not for the
   `src/lib/gsap` module itself (registration must run before any
   surface uses the plugin).
10. **Re-run Lighthouse and Vercel Speed Insights** after adding any
    new GSAP surface. Compare against the route budgets in
    [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md) §11.

## When to use which library

| Need | Library |
| ---- | ------- |
| Component entry/exit (fade, slide, blur) | **motion/react** — `BlurFade`, `FadeIn`, `Stagger`. Tiny, declarative, layout-effect timing. |
| In-view reveals (`whileInView`) | **motion/react** — already used everywhere. |
| Reduced-motion gating | **either**, via `useReducedMotion()` from motion/react. |
| Char-level text splitting with multi-line masks | **GSAP** — `SplitText` is the only ergonomic option. |
| Pinned scroll sections | **GSAP** — `ScrollTrigger` with `pin: true` (re-register the plugin when you add this). |
| Complex sequenced timelines (overlapping starts, labels, callbacks) | **GSAP** — `gsap.timeline()`. |
| Smooth scroll | **Lenis** (already wired, gated behind reduced-motion). |
| Particles / canvas atmospherics | **plain RAF + canvas** (already wired in `src/components/ui/magic/particles.tsx`). |

If a new motion need fits the GSAP column, reach for GSAP. If it
fits the motion/react column, stay there. Don't port existing
motion/react surfaces "to be consistent" — that just doubles cost.

## Rules of the road

1. **Always behind `"use client"`.** GSAP touches the DOM; it cannot
   render on the server.
2. **Always reduced-motion safe** (see rule 7 above).
3. **Always SSR-safe.** Either render the final state on the server
   and let `useGSAP` (`useLayoutEffect` internally) push to the
   initial-hidden state before paint, OR use a `mounted` latch. No
   `opacity: 0` on initial DOM — non-JS users must see content.
4. **Always use `useGSAP`** from `@gsap/react`. Auto-cleans on
   unmount + dependency change.
5. **EN-only for text-splitting.** Per
   [INTERACTION_TECHNIQUES.md](INTERACTION_TECHNIQUES.md) §5,
   char/word splitting is banned on `/zh`. The locale gate stays in
   the parent (`HeroSection`), not inside the GSAP component.
6. **Import `gsap` and plugins from `@/lib/gsap`**, never directly
   from `gsap/...`. The setup module is the single registration
   point.

## Bundle cost

Currently registered:

- `gsap` core: ~50 KB gzipped
- `SplitText` plugin: ~6 KB gzipped
- `@gsap/react` wrapper: ~1 KB gzipped

**Total cost: ~57 KB gz on `/`, `/work`, `/archive`.** Other routes
do not import any GSAP-using island, so they don't pay.

If `ScrollTrigger` gets added later, that's another ~25 KB and the
route(s) that import it will pay. Don't register it preemptively.

## Where it's used

| Surface | File | What |
| ------- | ---- | ---- |
| EN home hero — full sequence | `src/components/sections/hero-boot-sequence.tsx` | Master timeline orchestrating eyebrow → headline → subtitle → CTAs → CommandHero panel → HUD strip |
| EN home hero — headline | `src/components/sections/split-headline.tsx` | Char-staggered reveal with multi-line clip mask, plays in parallel with the boot sequence |
| `/work` mission-file deck | `src/components/sections/work-deck-reveal.tsx` | Tile drop-in with subtle rotation + scale stagger on initial mount; re-fires on filter changes via the wrapper `key` |
| `/archive` contact-sheet flash | `src/components/sections/contact-sheet-flash.tsx` | Random-stagger frame reveals like proofs developing across a contact sheet |

GSAP now lands on three routes (`/`, `/work`, `/archive`). Other
routes import nothing from `@/lib/gsap` and do not pay for it.

## Adding the next GSAP surface

1. Read the performance-safe rules above. If the new surface fits
   motion/react better, stop.
2. Build the component as `"use client"`.
3. Import `gsap` (and any plugin) from `@/lib/gsap`. If the new
   surface needs ScrollTrigger or another plugin, register it in
   the setup module — keep registrations centralized.
4. Pair with `useGSAP({ scope: ref })`.
5. Gate on `useReducedMotion()` from motion/react.
6. If the surface lives below the fold on a different route, wrap
   the consumer in `next/dynamic({ ssr: false })` so off-route users
   don't pay.
7. Document the surface in the table above and re-run Lighthouse.

## Removing the integration

If GSAP turns out not to earn its weight, the revert is bounded:

1. Revert `split-headline.tsx` to the motion/react word-stagger
   (git history preserves it on the commit before the GSAP PR).
2. Delete `src/components/sections/hero-boot-sequence.tsx` and
   strip the `data-boot` attributes + `HeroBootSequence` wrapper
   from `hero-section.tsx`.
3. Delete `src/lib/gsap.ts` and this doc.
4. `npm uninstall gsap @gsap/react`.

Total reverse-out: bounded to those four steps; no other code
touches the integration.
