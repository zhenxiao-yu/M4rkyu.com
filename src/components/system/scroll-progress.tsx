"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { usePathname } from "@/i18n/navigation";

/**
 * ScrollProgress — slim 2px bar pinned to the top of the viewport
 * that fills as the user scrolls the page. Spring-smoothed so the
 * fill doesn't jitter on small wheel ticks.
 *
 * Sits at z-50 above the sticky header so the indicator stays visible
 * across the dock. `aria-hidden` since it's decorative — the actual
 * scroll position is conveyed by the page itself.
 *
 * Reduced-motion: the spring is disabled (the bar tracks raw scroll
 * progress) so it can't introduce any extra motion artifact.
 *
 * Suppressed on `/logs/[slug]` because the post detail header
 * renders its own article-aware `<ReadingProgress />`. Two bars
 * stacked at the top of the viewport read as a bug.
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 36,
    mass: 0.45,
    restDelta: 0.001,
  });
  const pathname = usePathname();
  // next-intl strips the locale prefix from `usePathname`, so this
  // matches /logs/<slug> in any locale.
  const onPostDetail = /^\/logs\/[^/]+$/.test(pathname);
  if (onPostDetail) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-ring/0 via-ring to-foreground"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}
