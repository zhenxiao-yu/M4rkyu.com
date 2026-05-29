"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Thin reading-progress bar pinned to the very top edge of the viewport.
 * Tracks document scroll (0 → 1) and scales a ring-tinted line across the
 * width. Self-hides on pages that don't scroll (scaleX stays 0). The bar
 * reflects user scroll rather than playing on its own, so it's safe under
 * reduced motion — we just drop the spring smoothing and track raw scroll.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-ring",
        "shadow-[0_0_8px_-1px_color-mix(in_srgb,var(--ring)_70%,transparent)]",
        className,
      )}
    />
  );
}
