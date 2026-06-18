"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface HeroBootSequenceProps {
  children: ReactNode;
}

/**
 * Hero reveal — a single soft fade-up of the hero's `[data-hero-intro]`
 * elements on load, staggered bottom-up. SSR- and reduced-motion-safe:
 * the server markup is already visible, so reduced-motion users simply
 * skip the reveal. No scroll-scrubbed timeline — the hero is one calm
 * screen, not a scrub stage — so this island stays tiny.
 */
const HERO_SETTLE_DELAY = 0.05;

export function HeroBootSequence({ children }: HeroBootSequenceProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      const introItems =
        scope.querySelectorAll<HTMLElement>("[data-hero-intro]");
      if (introItems.length === 0) return;
      gsap.fromTo(
        introItems,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          delay: HERO_SETTLE_DELAY,
          duration: motionTokens.base,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "opacity,transform",
        },
      );
    }, scope);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div ref={scopeRef} className="contents">
      {children}
    </div>
  );
}
