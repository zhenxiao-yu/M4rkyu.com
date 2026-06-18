"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, registerScrollTrigger } from "@/lib/gsap";
import { registerSpineLenis } from "@/lib/home-spine";

interface HomeSmoothScrollProps {
  children: ReactNode;
}

/**
 * Home-only smooth scroll + GSAP ScrollTrigger bootstrap.
 *
 *   - Lenis: lerps wheel/touch into a smooth scroll velocity.
 *   - ScrollTrigger: lazy-registered for scroll-tied hero effects.
 *     Bridges Lenis' raf into `gsap.ticker` so scrubbed timelines
 *     read the lerped scroll position.
 *   - Reduced-motion + coarse-pointer: skips Lenis entirely (native scroll).
 *   - Lenis is paused whenever a dialog overlay opens so the modal's
 *     own scroll lock isn't undone by Lenis still hijacking wheel
 *     events on the page underneath.
 *
 * Mount once at the top of `src/app/[locale]/page.tsx` — never on
 * other routes.
 */
export function HomeSmoothScroll({ children }: HomeSmoothScrollProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined") return;

    // Marks the home route for route-scoped visual treatments. This no
    // longer enables scroll snapping: the home now scrolls continuously so
    // the hero can run scrubbed, whole-page animations.
    const root = document.documentElement;
    root.setAttribute("data-home-scroll", "");

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      // Touch devices keep native scroll: cheaper, less surprising, and
      // still compatible with the hero's CSS/sticky composition.
      return () => root.removeAttribute("data-home-scroll");
    }

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
    let rafBridge: ((time: number) => void) | null = null;

    (async () => {
      const [{ default: Lenis }, ST] = await Promise.all([
        import("lenis"),
        registerScrollTrigger(),
      ]);
      if (cancelled) return;

      // Snappier than Lenis defaults — 0.85s with steep ease-out so
      // wheel events feel responsive rather than draggy.
      const lenis = new Lenis({
        duration: 0.85,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 1.5,
      });
      lenisInstance = lenis;
      // Hand the instance to the spine helper so the hero cue + keyboard
      // paging scroll through Lenis instead of fighting its loop.
      registerSpineLenis(lenis);

      rafBridge = (time: number) => {
        lenisInstance?.raf(time * 1000);
      };
      gsap.ticker.add(rafBridge);
      gsap.ticker.lagSmoothing(0);

      scrollTriggerRef = ST;
      lenis.on("scroll", () => ST?.update());
      ST?.refresh();

      // Re-measure Lenis + ScrollTrigger when document height
      // changes. Without this, content that grows after mount (images,
      // fonts, dynamic sections) leaves stale scroll limits and scrub
      // endpoints.
      resizeObserver = new ResizeObserver(() => {
        lenisInstance?.resize();
        scrollTriggerRef?.refresh();
      });
      resizeObserver.observe(document.body);
      resizeObserver.observe(document.documentElement);

      // Pause Lenis whenever a dialog overlay is mounted+open.
      // Without this, Lenis keeps intercepting wheel events and the
      // page behind the modal visibly scrolls even though our explicit
      // body lock pinned `position: fixed`. Resume when the last
      // overlay unmounts.
      const sync = () => {
        if (!lenisInstance) return;
        const anyOpen = !!document.querySelector(
          '.m4-dialog-overlay[data-state="open"]',
        );
        if (anyOpen) {
          lenisInstance.stop();
        } else {
          lenisInstance.start();
        }
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
      root.removeAttribute("data-home-scroll");
      registerSpineLenis(null);
      dialogObserver?.disconnect();
      resizeObserver?.disconnect();
      if (rafBridge) gsap.ticker.remove(rafBridge);
      lenisInstance?.destroy();
      scrollTriggerRef?.killAll();
    };
  }, [reduce]);

  return <>{children}</>;
}
