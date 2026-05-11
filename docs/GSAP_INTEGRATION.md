# GSAP integration

Scoped integration of GSAP alongside the existing `motion/react`
animation system. GSAP is **not** a replacement for motion/react —
the two coexist with clear rules about which to reach for.

## What landed

- `gsap@3.15.0` and `@gsap/react@2.1.2` added to dependencies.
- `src/lib/gsap.ts` centralises plugin registration (ScrollTrigger,
  SplitText) and exports a `prefersReducedMotion()` helper plus
  `motionTokens` that mirror the CSS `--motion-*` / `--ease-*` tokens.
- `src/components/sections/split-headline.tsx` rewritten to use
  GSAP `SplitText` for the EN hero headline (was word-staggered via
  motion/react; now char-staggered with proper line-mask handling).

The motion/react system stays the default for everything else (31+
files unchanged). This PR is a single-surface integration, not a
migration.

## When to use which

| Need | Library |
| ---- | ------- |
| Component entry/exit (fade, slide, blur) | **motion/react** — `BlurFade`, `FadeIn`, `Stagger`. Tiny, declarative, layout-effect timing. |
| In-view reveals (`whileInView`) | **motion/react** — already used everywhere. |
| Reduced-motion gating | **either**, via `useReducedMotion()` from motion/react (works for both). |
| Char-level text splitting with multi-line masks | **GSAP** — `SplitText` is the only ergonomic option. |
| Pinned scroll sections | **GSAP** — `ScrollTrigger` with `pin: true`. motion/react's `useScroll` can simulate it but is fragile across breakpoints. |
| Complex sequenced timelines (overlapping starts, labels, callbacks) | **GSAP** — `gsap.timeline()` is the right tool. |
| Smooth scroll | **Lenis** (already wired, gated behind reduced-motion). |
| Particles / canvas atmospherics | **plain RAF + canvas** (already wired in `src/components/ui/magic/particles.tsx`). No animation lib needed. |

If a new motion need shows up that fits the GSAP column, reach for
GSAP. If it fits the motion/react column, stay there. Don't port
existing motion/react surfaces "to be consistent" — that just
doubles the cost.

## Rules of the road

1. **Always behind `"use client"`.** GSAP touches the DOM; it cannot
   render on the server.
2. **Always reduced-motion safe.** Short-circuit the timeline setup
   when `useReducedMotion()` returns `true`. The final state must
   render correctly without GSAP doing anything.
3. **Always SSR-safe.** Use a `mounted` latch (set in `useEffect`) so
   the server renders the final string / position. GSAP takes over
   only after hydration. No hydration mismatch, no layout shift.
4. **Always use `useGSAP`.** The `@gsap/react` helper handles cleanup
   automatically (calls `revert()` on unmount + dependency change).
   Manually managing `gsap.context` is more error-prone.
5. **EN-only for text-splitting.** Per
   [docs/INTERACTION_TECHNIQUES.md](INTERACTION_TECHNIQUES.md) §5,
   char- or word-level splitting is banned on `/zh` because CJK
   character widths and rendering rules make the stagger read off.
   The locale gate stays in the parent (`HeroSection`), not inside
   the component.
6. **Respect the perf budget.** GSAP core (~50 KB gz) + SplitText
   (~6 KB gz) + ScrollTrigger (~25 KB gz) is a real cost. Don't
   pull plugins you don't use; don't add plugins without a concrete
   surface that needs them.

## Bundle cost

The integration brings:

- `gsap` core: ~50 KB gzipped
- `SplitText` plugin: ~6 KB gzipped
- `ScrollTrigger` plugin: ~25 KB gzipped (loaded because we register
  it in the setup module; remove the import if no consumer ships)
- `@gsap/react` wrapper: ~1 KB gzipped

Because `src/lib/gsap.ts` is imported by a `"use client"` component
on the home route only, this cost lands on `/` first-load JS. It
does **not** appear on routes that never reach a GSAP-using island.

If `ScrollTrigger` doesn't get a consumer in a follow-up PR, remove
the registration line from `src/lib/gsap.ts` to drop ~25 KB.

## Where it's used

| Surface | File | What |
| ------- | ---- | ---- |
| EN home hero headline | `src/components/sections/split-headline.tsx` | Char-staggered reveal with multi-line clip mask |

That's the entire surface, intentionally.

## Adding the next GSAP surface

1. Read the rules of the road above. If the new surface fits motion/react better, stop.
2. Build the component as `"use client"`.
3. Import `gsap` (and any plugin) from `@/lib/gsap` — never directly
   from `gsap/...`. The setup module is the single registration
   point.
4. Pair with `useGSAP({ scope: ref })`.
5. Gate on `useReducedMotion()`.
6. Document the surface in the table above.

## Removing the integration

If GSAP turns out not to earn its weight:

1. Revert `split-headline.tsx` to the motion/react `motion.span`
   word-stagger implementation (git history preserves it as the
   commit before this PR).
2. Delete `src/lib/gsap.ts`.
3. `npm uninstall gsap @gsap/react`.
4. Delete this doc.

Total reverse-out: 4 commands, no other code touches the integration.
