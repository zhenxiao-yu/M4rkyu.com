"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

interface HeroClipFrameProps {
  children: ReactNode;
}

/**
 * Scroll-scrubbed clip-path + border-radius morph for the hero
 * substrate. Port of the `#video-frame` clip-path animation from
 * adrianhajdin/award-winning-website (their `Hero.jsx` lines 64–80),
 * but driven by `motion/react` `useScroll` instead of GSAP
 * ScrollTrigger — which is intentionally NOT registered in this
 * project to save its ~25 KB bundle cost (see `src/lib/gsap.ts`).
 *
 * As the user scrolls the first ~400px:
 *   - clipPath morphs from a flush rectangle to an asymmetric polygon
 *     that crops in from each corner.
 *   - borderRadius morphs from 0 to a non-uniform rounded shape.
 *
 * The visual effect: the hero deforms under scroll like a physical
 * card being slid out of frame, instead of static text fading out.
 *
 * Reduced-motion path: bypass both transforms, render the unmorphed
 * rectangle. Matches the pattern in `hud-scroll-frame.tsx`.
 */
export function HeroClipFrame({ children }: HeroClipFrameProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Rules of hooks — always call `useTransform`. When reduced motion
  // is on we ignore the mapped value and skip applying it.
  const clipPath = useTransform(
    scrollY,
    [0, 400],
    [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(8% 2%, 92% 0%, 96% 88%, 4% 96%)",
    ],
    { clamp: true },
  );
  const borderRadius = useTransform(
    scrollY,
    [0, 400],
    ["0px 0px 0px 0px", "32px 8px 64px 24px"],
    { clamp: true },
  );

  if (reduceMotion) {
    return (
      <div className="relative isolate overflow-hidden">{children}</div>
    );
  }

  return (
    <motion.div
      className="relative isolate overflow-hidden"
      style={{ clipPath, borderRadius }}
    >
      {children}
    </motion.div>
  );
}
