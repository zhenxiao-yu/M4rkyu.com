"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface HeroBootSequenceProps {
  children: ReactNode;
}

/**
 * Cinematic boot-sequence orchestrator for the homepage hero. Wraps
 * the entire hero content (server-rendered children stay
 * server-rendered) and runs a single GSAP timeline that animates
 * each beat in sequence:
 *
 *   1. `data-boot="eyebrow"`  — system label
 *   2. `data-boot="headline"` — char-staggered headline (handled by
 *                              SplitHeadline's own timeline; this
 *                              beat just kicks off in parallel)
 *   3. `data-boot="subtitle"` — supporting line
 *   4. `data-boot="ctas"`     — button row, items stagger
 *   5. `data-boot="panel"`    — CommandHero panel draws in
 *   6. `data-boot="hud"`      — HUD hint strip
 *
 * Why a master timeline instead of per-element animations:
 *   The hero now reads as a single sequenced moment rather than a
 *   handful of independent reveals racing each other. The pacing
 *   token defaults in `@/lib/gsap` keep it aligned with the rest of
 *   the site's motion.
 *
 * SSR-safe:
 *   - The children render fully visible on the server (no
 *     `opacity: 0` on the initial DOM). The first effect tick runs
 *     `gsap.set()` to push elements to their initial-hidden state
 *     and the timeline plays. The `useGSAP` helper uses
 *     `useLayoutEffect` internally so this happens before paint.
 *   - Reduced-motion: `gsap.set()` never runs, no timeline created,
 *     the elements stay in their final visible state.
 *
 * Performance discipline (matches docs/GSAP_INTEGRATION.md rules):
 *   - Animates only `opacity`, `y`, and `scale` — no width/height,
 *     no filter, no shadow.
 *   - No ScrollTrigger.
 *   - One timeline. Auto-killed on unmount via `useGSAP`.
 *   - Lives on `/` only — the rest of the site doesn't pay for
 *     this code.
 */
export function HeroBootSequence({ children }: HeroBootSequenceProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      const root = scopeRef.current;
      if (!root) return;

      const eyebrow = root.querySelector<HTMLElement>('[data-boot="eyebrow"]');
      const subtitle = root.querySelector<HTMLElement>('[data-boot="subtitle"]');
      const ctas = root.querySelectorAll<HTMLElement>('[data-boot="ctas"] > *');
      const panel = root.querySelector<HTMLElement>('[data-boot="panel"]');
      const hud = root.querySelector<HTMLElement>('[data-boot="hud"]');

      // Hide the elements we orchestrate. The headline is intentionally
      // not in this list — SplitHeadline runs its own char-stagger and
      // plays in parallel.
      const eased = motionTokens.easePremium;
      gsap.set(eyebrow, { opacity: 0, y: 8 });
      gsap.set(subtitle, { opacity: 0, y: 12 });
      gsap.set(ctas, { opacity: 0, y: 12 });
      gsap.set(panel, { opacity: 0, y: 16, scale: 0.985 });
      gsap.set(hud, { opacity: 0, y: 8 });

      const tl = gsap.timeline();
      tl.to(eyebrow, {
        opacity: 1,
        y: 0,
        duration: motionTokens.fast,
        ease: eased,
      })
        // Headline beat: SplitHeadline auto-plays at this point.
        // We don't tween anything here — the position just establishes
        // pacing for the next beat to land cleanly after it.
        .to(
          subtitle,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            ease: eased,
          },
          0.35,
        )
        .to(
          ctas,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            stagger: 0.08,
            ease: eased,
          },
          0.5,
        )
        .to(
          panel,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: motionTokens.slow,
            ease: eased,
          },
          0.25,
        )
        .to(
          hud,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            ease: eased,
          },
          0.95,
        );
    },
    { dependencies: [reduceMotion], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
