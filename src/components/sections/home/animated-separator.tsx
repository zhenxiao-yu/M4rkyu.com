"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedSeparatorProps {
  /** Marquee mode shows infinitely-scrolling mono text. Line mode shows
   *  a single animated keyline. Defaults to marquee. */
  mode?: "marquee" | "line";
  /** Mono text repeated across the marquee. */
  text?: string;
  className?: string;
}

const DEFAULT_TEXT =
  "M4RKYU.SYS · CREATIVE + DEVELOPER · ONTARIO · BUILT DELIBERATELY · EST. 2014";

/**
 * Thin horizontal band used between sections on the home page. Two
 * modes:
 *
 *   - `marquee` — doubled mono text track, translated left by 50%
 *     of its own width on an infinite loop. Reduced-motion: static.
 *   - `line` — single animated keyline (theme keyline drifting opacity).
 *
 * Sits flush across the full viewport; the inner track has a max-width
 * mask so the edges fade instead of clipping mid-glyph.
 */
export function AnimatedSeparator({
  mode = "marquee",
  text = DEFAULT_TEXT,
  className,
}: AnimatedSeparatorProps) {
  const reduce = useReducedMotion();

  if (mode === "line") {
    return (
      <div
        className={cn("relative h-12 sm:h-16", className)}
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-foreground/40 to-transparent" />
      </div>
    );
  }

  // Marquee: doubled track for seamless loop. mask fades the edges so
  // text never hard-clips.
  return (
    <div
      className={cn(
        "relative overflow-hidden border-y bg-muted/10 h-12 sm:h-14 flex items-center",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] pointer-events-none" />
      <div
        className={cn(
          "flex w-max gap-12 font-mono text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground whitespace-nowrap will-change-transform",
          !reduce && "animate-[marquee_28s_linear_infinite]",
        )}
      >
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
