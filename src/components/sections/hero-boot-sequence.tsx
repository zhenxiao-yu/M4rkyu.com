"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, motionTokens } from "@/lib/gsap";
import { onBootDone } from "@/lib/system/boot-signal";

interface HeroBootSequenceProps {
  children: ReactNode;
}

/**
 * Hero reveal — a single soft fade-up of the hero's `[data-hero-intro]`
 * elements, staggered bottom-up. It holds the elements hidden until the boot
 * sequence hands off (`onBootDone`), so the hero springs to life exactly as
 * the curtain lifts — one continuous motion. A timeout fallback guarantees
 * the reveal even if the boot island never signals (e.g. chunk error), and
 * `onBootDone` fires synchronously when the boot has already handed off
 * (reduced motion, or a returning SPA visit), so the hero never stays hidden.
 * SSR- and reduced-motion-safe: reduced-motion users skip straight to the
 * already-visible server markup.
 */
const HERO_SETTLE_DELAY = 0.05;
const BOOT_FALLBACK_MS = 6000;

export function HeroBootSequence({ children }: HeroBootSequenceProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const scope = scopeRef.current;
    if (!scope) return;

    const introItems =
      scope.querySelectorAll<HTMLElement>("[data-hero-intro]");
    if (introItems.length === 0) return;

    // Hold hidden until the boot hands off.
    gsap.set(introItems, { opacity: 0, y: 16 });

    let ctx: ReturnType<typeof gsap.context> | null = null;
    let fired = false;
    const reveal = () => {
      if (fired) return;
      fired = true;
      ctx = gsap.context(() => {
        gsap.to(introItems, {
          opacity: 1,
          y: 0,
          delay: HERO_SETTLE_DELAY,
          duration: motionTokens.base,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "opacity,transform",
        });
      }, scope);
    };

    const off = onBootDone(reveal);
    const fallback = window.setTimeout(reveal, BOOT_FALLBACK_MS);

    return () => {
      off();
      window.clearTimeout(fallback);
      ctx?.revert();
    };
  }, [reduceMotion]);

  return (
    <div ref={scopeRef} className="contents">
      {children}
    </div>
  );
}
