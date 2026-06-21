"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getInkWipeServerSnapshot,
  getInkWipeSnapshot,
  subscribeInkWipe,
} from "@/lib/route-transition";
import { cn } from "@/lib/utils";

/**
 * Ink curtain — the full-viewport accent-ink sweep that covers a route
 * change. Driven entirely by the `route-transition` store (subscribed via
 * `useSyncExternalStore`); `TransitionLink` triggers the sequence, this only
 * paints the current phase.
 *
 * Motion: a single SVG panel bounded by two quadratic-bezier edges, morphed
 * via `motion/react` (the `d` attribute). The curve *leads* the motion in
 * both directions — the right edge bows forward as it sweeps in to cover, and
 * the left edge bows forward as it sweeps off to reveal the new page. The
 * route swaps behind the cover; idle parks the whole shape off the left edge
 * so nothing paints in the viewport at rest.
 *
 * `viewBox="0 0 100 100"` + `preserveAspectRatio="none"` makes it resolution-
 * independent (no measuring the window) and cheap — one (well, two) filled
 * paths, no blend modes, halftone screens, or blurred shadows. Riso character,
 * two inks: a `--ring` panel with a faint `--ring-2` overprint offset behind
 * it (misregistration). Mounted once in the locale layout so it persists
 * across the navigation it animates.
 *
 * Decorative + inert: `aria-hidden`, `pointer-events` only while a wipe runs.
 * Reduced-motion never reaches here (the store navigates instantly), but the
 * `useReducedMotion()` guard is still load-bearing — the global CSS
 * `animation-duration` clamp does not reach motion's JS-driven `animate`.
 */

// Panel bounded by two quadratic edges: `M (left) Q (left curve) L (bottom)
// Q (right curve) Z`. Every state keeps this exact command structure
// (M Q L Q Z) so motion can interpolate `d` instead of snap-swapping it.
//
//   PARKED  — off the left edge: the curved leading edge tops out at x ≈ -17
//             (primary) / -14 (the +3 secondary), both < 0 → nothing in the
//             viewport. Do not nudge these toward 0 or the ink bleeds back in.
//   COVERED — both edges flat, x∈[-40,100] ⊇ viewport → full cover.
//   EXITED  — off the right edge (min x = 110 → fully uncovered).
const PARKED = "M -60 0 Q -60 50 -60 100 L -25 100 Q -10 50 -25 0 Z";
const COVERED = "M -40 0 Q -40 50 -40 100 L 100 100 Q 100 50 100 0 Z";
const EXITED = "M 110 0 Q 125 50 110 100 L 160 100 Q 160 50 160 0 Z";

// Secondary ink — the same path shifted +3 on x (overprint misregistration).
const PARKED_2 = "M -57 0 Q -57 50 -57 100 L -22 100 Q -7 50 -22 0 Z";
const COVERED_2 = "M -37 0 Q -37 50 -37 100 L 103 100 Q 103 50 103 0 Z";
const EXITED_2 = "M 113 0 Q 128 50 113 100 L 163 100 Q 163 50 163 0 Z";

// Cubic-bezier mirrors --ease-premium; motion's transition.ease cannot read
// CSS variables.
const EASE = [0.2, 0.7, 0.2, 1] as const;

export function InkCurtain() {
  const { phase, coverMs, revealMs } = useSyncExternalStore(
    subscribeInkWipe,
    getInkWipeSnapshot,
    getInkWipeServerSnapshot,
  );
  const reduce = useReducedMotion();

  const active = phase !== "idle";
  const target =
    !reduce && phase === "covering"
      ? { d: COVERED, d2: COVERED_2 }
      : !reduce && phase === "revealing"
        ? { d: EXITED, d2: EXITED_2 }
        : { d: PARKED, d2: PARKED_2 };
  const durationMs =
    phase === "covering" ? coverMs : phase === "revealing" ? revealMs : 0;
  const transition = reduce
    ? { duration: 0 }
    : { duration: durationMs / 1000, ease: EASE };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-120 overflow-hidden",
        active ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Overprint ink — sits behind, offset a hair for misregistration.
         * Hidden on mobile: a `d` morph rasters on the main thread per frame,
         * so dropping the second full-viewport path halves that cost on the
         * devices that feel it most (the +3px overprint is invisible at phone
         * DPI / duration anyway). */}
        <motion.path
          className="max-sm:hidden"
          initial={{ d: PARKED_2 }}
          animate={{ d: target.d2 }}
          transition={transition}
          fill="var(--ring-2)"
          opacity={0.5}
        />
        {/* Primary ink. */}
        <motion.path
          initial={{ d: PARKED }}
          animate={{ d: target.d }}
          transition={transition}
          fill="var(--ring)"
        />
      </svg>
    </div>
  );
}
