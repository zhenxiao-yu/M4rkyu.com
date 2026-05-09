"use client";

// Adapted from Magic UI · sprint-4 phase 4.4

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  /** Stroke width in px. Default: 1. */
  borderWidth?: number;
  /** Sweep duration in seconds. Default: 14. */
  duration?: number;
  /** Border-radius in px to match the parent. Default: 8. */
  borderRadius?: number;
  /** Highlight color (CSS color). Default: var(--ring). */
  shineColor?: string;
  className?: string;
}

/**
 * Quieter cousin of `BorderBeam`: paints a slow conic-gradient sweep
 * around its parent's border. Use sparingly on cards that earn a
 * single attention pull (no more than one per viewport, per
 * `docs/UI_LIBRARY_STRATEGY.md`).
 *
 * Place inside a `position: relative` parent. Becomes a static
 * 1px border on `prefers-reduced-motion: reduce`.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  borderRadius = 8,
  shineColor = "var(--ring)",
  className,
}: ShineBorderProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          className,
        )}
        style={{
          border: `${borderWidth}px solid color-mix(in srgb, ${shineColor} 30%, transparent)`,
          borderRadius,
        }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{
        padding: borderWidth,
        borderRadius,
        // Mask out the inner area so only the border shows the gradient sweep.
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        maskComposite: "exclude",
      }}
      initial={{ "--shine-angle": "0deg" } as never}
      animate={{ "--shine-angle": "360deg" } as never}
      // Linear keeps the sweep steady; motion's transition.ease cannot read CSS variables.
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="size-full rounded-[inherit]"
        style={{
          background: `conic-gradient(from var(--shine-angle, 0deg), transparent 0deg, ${shineColor} 60deg, transparent 120deg, transparent 360deg)`,
        }}
      />
    </motion.div>
  );
}
