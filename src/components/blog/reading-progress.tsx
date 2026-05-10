"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/**
 * 2px-tall ring-color bar fixed under the sticky site header that
 * tracks scroll progress through the post page.
 *
 * Honors `prefers-reduced-motion` by short-circuiting to `null` —
 * the bar is purely ornamentation; reduced-motion users lose
 * nothing functional. The spring smooths the scroll-driven motion
 * so the bar glides instead of jittering on each frame.
 *
 * The reduced-motion check is intentionally done with `useState` +
 * `useEffect` rather than `useReducedMotion()` from `motion/react`.
 * That hook reads a module-scope `matchMedia` listener that is
 * already populated on the client at first render, so its initial
 * value differs from the SSR `null` and triggers a React #418
 * hydration mismatch on the post route. Starting from a fixed
 * `false` and resolving in an effect keeps the SSR HTML and the
 * first client render in lockstep.
 */
export function ReadingProgress() {
  const [enabled, setEnabled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 22,
    mass: 0.4,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (!enabled) return null;

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
