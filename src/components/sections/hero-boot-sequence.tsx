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
 * server-rendered) and runs a single GSAP timeline.
 *
 * Audit-pass beat layout (re-paced for fewer overlaps, longer per-
 * beat durations, total perceived run ≈ 1.1s):
 *
 *   t=0.00  eyebrow         (fade-up, fast)
 *   t=0.15  corner-display  (fade-up, slow — watermark settles)
 *   t=0.20  headline        (SplitHeadline auto-plays, parallel)
 *   t=0.40  subtitle        (fade-up, base)
 *   t=0.30  panel           (fade-up, slow — runs alongside subtitle)
 *   t=0.65  ctas            (stagger, base)
 *   t=0.80  preview         (scale-in, base — last interactive element)
 *   t=0.95  hud             (fade-up, fast — final settle)
 *
 * Specs strip beat retired: the strip is no longer inside the hero
 * (moved to its own band below the hero on the home page).
 *
 * SSR-safe + reduced-motion-safe + ScrollTrigger-free as before.
 * Performance discipline (matches docs/GSAP_INTEGRATION.md rules):
 *   - Animates only `opacity`, `y`, and `scale`.
 *   - One timeline. Auto-killed on unmount via `useGSAP`.
 *   - Lives on `/` only.
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
      const hud = root.querySelector<HTMLElement>('[data-boot="hud"]');

      // Hide the elements we orchestrate. The headline is intentionally
      // not in this list — SplitHeadline runs its own char-stagger and
      // plays in parallel.
      //
      // Beats (sparser hero post wodniack rebuild — corner display
      // retired so this stays a flat 4-beat reveal):
      //   t=0.00  eyebrow
      //   t=0.20  headline (SplitHeadline auto-plays in parallel)
      //   t=0.35  subtitle
      //   t=0.50  ctas (stagger)
      //   t=0.80  hud strip
      const eased = motionTokens.easePremium;
      gsap.set(eyebrow, { opacity: 0, y: 8 });
      gsap.set(subtitle, { opacity: 0, y: 12 });
      gsap.set(ctas, { opacity: 0, y: 12 });
      gsap.set(hud, { opacity: 0, y: 8 });

      const tl = gsap.timeline();
      tl.to(eyebrow, {
        opacity: 1,
        y: 0,
        duration: motionTokens.fast,
        ease: eased,
      })
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
          hud,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.fast,
            ease: eased,
          },
          0.8,
        );
    },
    { dependencies: [reduceMotion], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
