"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: string;
  className?: string;
}

/**
 * Single-shot RGB-split glitch on mount. Renders three layers:
 * - the visible text (foreground colour);
 * - `::before` clipped to the upper half, pushed -2px in the ring colour;
 * - `::after` clipped to the lower half, pushed +2px in the signal colour.
 *
 * The keyframes (`glitch-slice-a`, `glitch-slice-b`) live in
 * `globals.css`. They're step-based and run once for ~320ms, then
 * the pseudo-element layers settle to opacity:0 so the title sits
 * still after the entry. Reduced-motion → plain text, no pseudo
 * decoration.
 *
 * The `data-text` attribute is what the pseudo-elements duplicate;
 * `children` must be a plain string.
 */
export function GlitchText({ children, className }: GlitchTextProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span className={className}>{children}</span>;
  }
  return (
    // The visible text is the host's own children, so screen
    // readers announce it directly. Pseudo-element `content` is
    // excluded from the a11y tree, so no `aria-label` needed —
    // adding one would risk double-announcement on some AT.
    <span
      className={cn("glitch-text relative inline-block", className)}
      data-text={children}
    >
      {children}
    </span>
  );
}
