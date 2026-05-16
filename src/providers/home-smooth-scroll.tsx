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
 *   - Lenis is paused whenever a dialog overlay opens so the modal's
 *     own scroll lock isn't undone by Lenis still hijacking wheel
 *     events on the page underneath.
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
      stop: () => void;
      start: () => void;
      resize: () => void;
    } | null = null;
    let scrollTriggerRef:
      | typeof import("gsap/ScrollTrigger").ScrollTrigger
      | null = null;
    let dialogObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

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

      // Re-measure Lenis + ScrollTrigger when document height changes.
      // Without this, content that grows after mount (images, fonts,
      // dynamic sections) leaves Lenis with a stale scroll limit —
      // the wheel feels like it bottoms out before the page does.
      // ScrollTrigger.refresh() also recomputes scrub positions so
      // pinned sections stay anchored to their content as it shifts.
      resizeObserver = new ResizeObserver(() => {
        lenisInstance?.resize();
        scrollTriggerRef?.refresh();
      });
      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);

      // Pause Lenis whenever a dialog overlay is mounted+open. Without
      // this, Lenis keeps intercepting wheel events and animating
      // `body`'s transform — the page behind the modal visibly
      // scrolls even though our explicit body lock pinned `position:
      // fixed`. Resume when the last overlay unmounts.
      const sync = () => {
        if (!lenisInstance) return;
        const anyOpen = !!document.querySelector(
          '.m4-dialog-overlay[data-state="open"]',
        );
        if (anyOpen) lenisInstance.stop();
        else lenisInstance.start();
      };
      dialogObserver = new MutationObserver(sync);
      dialogObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
      sync();
    })();

    return () => {
      cancelled = true;
      dialogObserver?.disconnect();
      resizeObserver?.disconnect();
      lenisInstance?.destroy();
      scrollTriggerRef?.killAll();
    };
  }, [reduce]);

  return <>{children}</>;
}
