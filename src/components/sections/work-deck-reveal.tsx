"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface WorkDeckRevealProps {
  children: ReactNode;
  /**
   * CSS selector relative to the wrapper that matches each
   * mission-file tile. Defaults to `[data-deck-card]`.
   */
  cardSelector?: string;
}

/**
 * "Mission-file deck" reveal for the /work route. On first mount,
 * tiles drop in from a slight negative Y with a subtle rotation, like
 * the operator slapping cards down on a console. Each tile staggers
 * 50ms after the previous; total perceived completion under 700ms.
 *
 * Architecture:
 *   - Wrapper is a "use client" component but server-rendered children
 *     stay server-rendered. We pick up the tiles by data-attribute
 *     selector so the tile components themselves can stay pure.
 *   - One GSAP timeline. Animates transform + opacity only — no
 *     filters, no width/height. Auto-killed on unmount via useGSAP.
 *   - Reduced-motion: timeline never runs, tiles render in their
 *     final visible state.
 *
 * Mobile pacing: GSAP `stagger.each` halves on small viewports via
 * `matchMedia("(max-width: 640px)")` so the deck reveal feels snappy
 * on touch, never blocking interaction past ~400ms.
 *
 * Performance discipline (per docs/GSAP_INTEGRATION.md §6):
 *   - One signature moment on this page. ✓
 *   - No ScrollTrigger. ✓
 *   - transform + opacity only. ✓
 *   - Reduced-motion early-return. ✓
 */
export function WorkDeckReveal({
  children,
  cardSelector = "[data-deck-card]",
}: WorkDeckRevealProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      const root = scopeRef.current;
      if (!root) return;
      const cards = root.querySelectorAll<HTMLElement>(cardSelector);
      if (cards.length === 0) return;

      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 640px)").matches;

      gsap.set(cards, {
        opacity: 0,
        y: -16,
        rotate: -0.4,
        scale: 0.985,
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        duration: isMobile ? motionTokens.base : motionTokens.slow,
        ease: motionTokens.easePremium,
        stagger: isMobile ? 0.03 : 0.05,
      });
    },
    { dependencies: [reduceMotion, cardSelector], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
