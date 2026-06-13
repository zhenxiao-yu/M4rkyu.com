"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface HeroBootSequenceProps {
  children: ReactNode;
}

/**
 * Boot-sequence orchestrator for the homepage hero. Wraps the
 * server-rendered hero and runs one small GSAP reveal.
 *
 * The hero is atmosphere-first: a switchable WebGL backdrop with the
 * "Compile ✦ Compose" wordmark band centred over it. The headline animates
 * itself (the `Shuffle` islands inside `HeroWordmark`), so the only thing
 * this orchestrates is the frosted wordmark band (`data-boot="hud"`) — we
 * let the interactive field breathe for a beat, then settle the band into
 * place over it.
 *
 * SSR-safe, reduced-motion-safe, ScrollTrigger-free. Performance discipline
 * (docs/GSAP_INTEGRATION.md): animates only `opacity` + `y`, one tween,
 * auto-killed on unmount via `useGSAP`, lives on `/` only.
 */
// Let the interactive backdrop register before the wordmark band settles in.
const BAND_SETTLE_DELAY = 0.8;

export function HeroBootSequence({ children }: HeroBootSequenceProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      const band = scopeRef.current?.querySelector<HTMLElement>(
        '[data-boot="hud"]',
      );
      if (!band) return;

      gsap.set(band, { opacity: 0, y: 8 });
      gsap.to(band, {
        opacity: 1,
        y: 0,
        delay: BAND_SETTLE_DELAY,
        duration: motionTokens.fast,
        ease: motionTokens.easePremium,
      });
    },
    { dependencies: [reduceMotion], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
