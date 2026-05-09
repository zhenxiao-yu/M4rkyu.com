"use client";

// Adapted from Magic UI · BorderBeam · sprint-2 phase 2.3

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  /**
   * Beam color at peak. Defaults to `var(--ring)` so the trace
   * stays in the brand cyan.
   */
  colorFrom?: string;
  /**
   * Tail color (transparent by default for a quiet light trace
   * rather than a solid neon ring).
   */
  colorTo?: string;
  /** CSS border radius for the beam mask, in px. */
  borderRadius?: number;
  /** CSS border width for the beam, in px. */
  borderWidth?: number;
}

/**
 * Quiet light trace that runs around a card's border. Designed to
 * highlight a SINGLE element on a page (per docs/UI_LIBRARY_STRATEGY.md
 * §9 — "more than one BorderBeam in view at once is banned").
 *
 * Honors prefers-reduced-motion: returns nothing, so the host card
 * looks identical to its non-highlighted siblings.
 */
export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "var(--ring)",
  colorTo = "transparent",
  borderRadius = 8,
  borderWidth = 1.5,
}: BorderBeamProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      style={{ borderRadius }}
    >
      <motion.div
        className="absolute"
        style={{
          width: size,
          aspectRatio: "1 / 1",
          background: `conic-gradient(from 0deg at 50% 50%, ${colorTo} 0deg, ${colorFrom} 60deg, ${colorTo} 120deg)`,
          maskImage: `linear-gradient(transparent calc(50% - ${borderWidth}px), black 50%, transparent calc(50% + ${borderWidth}px))`,
          WebkitMaskImage: `linear-gradient(transparent calc(50% - ${borderWidth}px), black 50%, transparent calc(50% + ${borderWidth}px))`,
          offsetPath: `rect(0 100% 100% 0 round ${borderRadius}px)`,
          offsetDistance: "0%",
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        // Cubic-bezier mirrors --ease-premium; motion's transition.ease cannot read CSS variables.
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: [0.2, 0.7, 0.2, 1],
        }}
      />
    </div>
  );
}
