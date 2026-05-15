"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, registerScrollTrigger } from "@/lib/gsap";

interface HomeSmoothScrollProps {
  children: ReactNode;
}

/**
 * Home-only smooth scroll + GSAP ScrollTrigger bootstrap.
 *
 *   - Lenis: lerps wheel/touch into a smooth scroll velocity.
 *   - ScrollTrigger: lazy-registered for future scroll-tied effects.
 *     Bridges Lenis' raf into `gsap.ticker` so scrubbed timelines
 *     read the lerped scroll position.
 *   - Reduced-motion + coarse-pointer: skips Lenis entirely (native
 *     scroll, no scrub).
 *
 * Snap removed — sections are `min-h-dvh` so they self-anchor when the
 * user scrolls; an explicit snap layer (mandatory or proximity) was
 * pulling the scroll back to the previous section's start when the
 * user stopped just past a boundary.
 *
 * Mount once at the top of `src/app/[locale]/page.tsx` — never on
 * other routes.
 */
export function HomeSmoothScroll({ children }: HomeSmoothScrollProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;

    let cancelled = false;
    let lenisInstance: {
      destroy: () => void;
      raf: (t: number) => void;
    } | null = null;
    let scrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    (async () => {
      const [{ default: Lenis }, ST] = await Promise.all([
        import("lenis"),
        registerScrollTrigger(),
      ]);
      if (cancelled) return;

      // Snappier than Lenis defaults — 0.85s with steep ease-out so
      // wheel events feel responsive rather than draggy.
      lenisInstance = new Lenis({
        duration: 0.85,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.5,
      });

      function rafBridge(time: number) {
        lenisInstance?.raf(time * 1000);
      }
      gsap.ticker.add(rafBridge);
      gsap.ticker.lagSmoothing(0);

      scrollTriggerRef = ST;
      ST?.refresh();
    })();

    return () => {
      cancelled = true;
      lenisInstance?.destroy();
      scrollTriggerRef?.killAll();
    };
  }, [reduce]);

  return <>{children}</>;
}
