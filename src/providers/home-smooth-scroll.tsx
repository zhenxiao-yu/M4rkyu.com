"use client";

import { useEffect, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, registerScrollTrigger } from "@/lib/gsap";

interface HomeSmoothScrollProps {
  children: ReactNode;
}

/**
 * Home-only smooth scroll + page-snap + GSAP ScrollTrigger bootstrap.
 *
 *   - Lenis: lerps wheel/touch into a smooth scroll velocity.
 *   - Lenis Snap: picks up every `[data-snap=section]` element on the
 *     page and snaps the scroll target to its top with eased lerp.
 *     `proximity` snap-type keeps long sections (SelectedWork,
 *     FramesGallery) scrollable internally — snap only engages when
 *     velocity decays near a boundary, working WITH the lerp instead
 *     of fighting it.
 *   - ScrollTrigger: lazy-registered for future scroll-tied effects.
 *     Bridges Lenis' raf into `gsap.ticker` so scrubbed timelines
 *     read the lerped scroll position.
 *   - Reduced-motion + coarse-pointer: skips Lenis entirely (native
 *     scroll, no snap, no scrub).
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
    let snapInstance: { destroy: () => void } | null = null;
    let scrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    (async () => {
      const [{ default: Lenis }, { default: Snap }, ST] = await Promise.all([
        import("lenis"),
        import("lenis/snap"),
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

      // Wire snap. `mandatory` actively pulls the scroll to the
      // nearest registered snap target after every wheel/touch
      // gesture settles — true "page-turn" feel that matches the
      // user's request. Lenis Snap respects long sections internally
      // because each section is its OWN snap point: scrolling within
      // a section doesn't fire snap, only the gesture that crosses a
      // boundary does. Tight debounce (150 ms) so the snap engages
      // quickly after the wheel stops, and a short duration so the
      // last-mile correction lands without feeling sluggish.
      const snap = new Snap(lenisInstance as unknown as import("lenis").default, {
        type: "mandatory",
        duration: 0.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        debounce: 150,
      });

      // Register every top-level snap section currently on the page.
      // The MutationObserver below picks up any added after the
      // initial mount (e.g. when an island lazy-renders).
      function attachSnapTargets() {
        document
          .querySelectorAll<HTMLElement>("[data-snap='section']")
          .forEach((el) => {
            if (el.dataset.snapAttached === "1") return;
            snap.addElement(el, { align: ["start"] });
            el.dataset.snapAttached = "1";
          });
      }
      attachSnapTargets();
      const mo = new MutationObserver(attachSnapTargets);
      mo.observe(document.body, { subtree: true, childList: true });

      snapInstance = {
        destroy: () => {
          mo.disconnect();
          snap.destroy();
        },
      };

      scrollTriggerRef = ST;
      ST?.refresh();
    })();

    return () => {
      cancelled = true;
      snapInstance?.destroy();
      lenisInstance?.destroy();
      scrollTriggerRef?.killAll();
    };
  }, [reduce]);

  return <>{children}</>;
}
