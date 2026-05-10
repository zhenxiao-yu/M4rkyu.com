"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * 2px-tall ring-color bar fixed under the sticky site header that
 * tracks scroll progress through the post page.
 *
 * Honors `prefers-reduced-motion` by short-circuiting to `null` —
 * the bar is purely ornamentation; reduced-motion users lose
 * nothing functional. The spring smooths the scroll-driven motion
 * so the bar glides instead of jittering on each frame.
 */
export function ReadingProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.4,
  });

  // `useReducedMotion()` is tri-state — `null` until the media
  // query resolves, then `true | false`. Treat anything other than
  // an explicit `false` as "reduced" so the bar doesn't flash for
  // one frame then unmount on first paint.
  if (reduceMotion !== false) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, transformOrigin: "0% 50%" }}
      // Sticky header is h-14 (<sm) / h-16 (sm+); the progress bar
      // anchors flush with its lower border on each breakpoint.
      className="pointer-events-none fixed left-0 right-0 top-14 z-30 h-[2px] origin-left bg-ring/80 sm:top-16"
    />
  );
}
