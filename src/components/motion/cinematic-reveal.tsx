"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A bolder scroll-entrance than `FadeIn` — the home spine's cinematic reveal.
 * As the block scrolls in, it lifts, un-scales and resolves out of a deep
 * blur (the "deep-blur → scale-up" feel). One-shot (`once`), so it settles and
 * never re-animates.
 *
 * Reduced motion renders the final state with no tween. SSR renders the
 * pre-reveal state (like the existing FadeIn/BlurFade), so the entrance plays
 * once on first scroll-in; the content is real DOM either way.
 */
export function CinematicReveal({
  children,
  className,
  delay = 0,
  /** Entrance distance in px. */
  y = 32,
  /** Starting scale (scales up to 1). */
  scaleFrom = 0.93,
  /** Starting blur in px (resolves to 0). */
  blur = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scaleFrom?: number;
  blur?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -18% 0px" });
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      initial={{ opacity: 0, y, scale: scaleFrom, filter: `blur(${blur}px)` }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : undefined
      }
      transition={{
        duration: 0.85,
        // Inline carve-out: motion/react's `transition.ease` can't read the
        // CSS var, so --ease-premium (cubic-bezier(0.2,0.7,0.2,1)) is mirrored.
        ease: [0.2, 0.7, 0.2, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
