"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface HeroBootSequenceProps {
  children: ReactNode;
}

/**
 * Boot-sequence orchestrator for the homepage risograph hero. Wraps the
 * server-rendered hero (children stay server-rendered) and runs one GSAP
 * timeline that staggers the broadsheet into place:
 *
 *   t=0.00  eyebrow   (masthead edition line)
 *   t=0.15  headline  (lift + fade; .m4-overprint ink registers alongside)
 *   t=0.35  subtitle
 *   t=0.50  ctas      (stagger)
 *   t=0.80  hud       (colophon rail)
 *
 * SSR-safe + reduced-motion-safe + ScrollTrigger-free.
 * Performance discipline (docs/GSAP_INTEGRATION.md):
 *   - Animates only `opacity` and `y`.
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
      const headline = root.querySelector<HTMLElement>(
        '[data-boot="headline"]',
      );
      const subtitle = root.querySelector<HTMLElement>(
        '[data-boot="subtitle"]',
      );
      const ctas = root.querySelectorAll<HTMLElement>('[data-boot="ctas"] > *');
      const hud = root.querySelector<HTMLElement>('[data-boot="hud"]');

      // Hide the elements we orchestrate, then reveal in sequence. The
      // risograph broadsheet hero is a flat 5-beat reveal; the headline's
      // ink registration (.m4-overprint, CSS) settles alongside its lift.
      //   t=0.00  eyebrow (masthead edition line)
      //   t=0.15  headline (lift + fade; overprint registers in parallel)
      //   t=0.35  subtitle
      //   t=0.50  ctas (stagger)
      //   t=0.80  hud (colophon rail)
      const eased = motionTokens.easePremium;
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 8 });
      if (headline) gsap.set(headline, { opacity: 0, y: 14 });
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 12 });
      if (ctas.length > 0) gsap.set(ctas, { opacity: 0, y: 12 });
      if (hud) gsap.set(hud, { opacity: 0, y: 8 });

      const tl = gsap.timeline();
      if (eyebrow) {
        tl.to(eyebrow, {
          opacity: 1,
          y: 0,
          duration: motionTokens.fast,
          ease: eased,
        });
      }
      if (headline) {
        // Lift + fade only — no scale, so the risograph `.m4-overprint`
        // ink-registration (CSS, on the ::before/::after ghosts) settles
        // cleanly underneath without a competing transform.
        tl.to(
          headline,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            ease: eased,
          },
          0.15,
        );
      }
      if (subtitle) {
        tl.to(
          subtitle,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            ease: eased,
          },
          0.35,
        );
      }
      if (ctas.length > 0) {
        tl.to(
          ctas,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.base,
            stagger: 0.08,
            ease: eased,
          },
          0.5,
        );
      }
      if (hud) {
        tl.to(
          hud,
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.fast,
            ease: eased,
          },
          0.8,
        );
      }
    },
    { dependencies: [reduceMotion], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
