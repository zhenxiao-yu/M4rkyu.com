"use client";

import { useSyncExternalStore } from "react";
import {
  getInkWipeServerSnapshot,
  getInkWipeSnapshot,
  subscribeInkWipe,
} from "@/lib/route-transition";
import { cn } from "@/lib/utils";

/**
 * Ink curtain — the full-viewport accent-ink panel that wipes across on
 * every route change. Driven entirely by the `route-transition` store
 * (subscribed via `useSyncExternalStore`); `TransitionLink` triggers the
 * sequence, this only paints the current phase.
 *
 * Motion: a straight translate wipe (GPU `transform` only, bulletproof
 * coverage). Cover slides the panel in from the left over the outgoing
 * page; the route swaps behind it; reveal slides it off to the right,
 * uncovering the new page. The idle phase parks it off-screen with no
 * transition so the next wipe starts clean.
 *
 * Riso character (two inks, never a third): a `--ring` field, a `--ring-2`
 * overprint wash bleeding off the trailing edge (misregistration), a
 * halftone dot screen, and a wet highlight at the leading edge.
 *
 * Mounted once in the locale layout, so it persists across the navigation
 * it animates. Decorative + inert: `aria-hidden`, and `pointer-events`
 * only while a wipe is actually running. Reduced-motion never reaches here
 * — the store navigates instantly instead of emitting a non-idle phase.
 */
export function InkCurtain() {
  const { phase, coverMs, revealMs } = useSyncExternalStore(
    subscribeInkWipe,
    getInkWipeSnapshot,
    getInkWipeServerSnapshot,
  );

  const active = phase !== "idle";
  const transform =
    phase === "covering"
      ? "translateX(0)"
      : phase === "revealing"
        ? "translateX(100%)"
        : "translateX(-100%)";
  const durationMs =
    phase === "covering" ? coverMs : phase === "revealing" ? revealMs : 0;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 z-[120] overflow-hidden",
        active ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        className="absolute inset-0 bg-ring"
        style={{
          transform,
          transition: durationMs
            ? `transform ${durationMs}ms var(--ease-premium)`
            : "none",
          willChange: active ? "transform" : undefined,
        }}
      >
        {/* Overprint misregistration — a secondary-ink wash bleeding off the
          * trailing edge. The riso signature. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1/3 mix-blend-multiply"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--ring-2) 60%, transparent), transparent)",
          }}
        />
        {/* Halftone dot screen — de-digitises the flat ink like a printed
          * sheet (background-coloured dots knocked out of the accent). */}
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(var(--background) 0.5px, transparent 1.1px)",
            backgroundSize: "5px 5px",
          }}
        />
        {/* Wet leading edge — a thin skewed highlight that reads as the ink
          * front as it sweeps in. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-2.5 -skew-x-6"
          style={{
            background: "color-mix(in srgb, var(--background) 72%, var(--ring))",
            boxShadow:
              "0 0 26px 2px color-mix(in srgb, var(--ring) 70%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
