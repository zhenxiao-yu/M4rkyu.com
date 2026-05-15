"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  children: ReactNode;
  /** Duration of one sweep in seconds. Default 3. */
  duration?: number;
  className?: string;
}

/**
 * Subtle gradient sweep across text. Reduced-motion = static gradient
 * (still readable, no animation). Token-aware: uses `--foreground` and
 * `--ring` rather than hard-coded colors.
 */
export function ShinyText({ children, duration = 3, className }: ShinyTextProps) {
  const reduce = useReducedMotion();
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent bg-[linear-gradient(110deg,var(--muted-foreground)_30%,var(--foreground)_50%,var(--muted-foreground)_70%)] bg-[length:200%_100%]",
        !reduce && "animate-[shiny_var(--shiny-duration)_linear_infinite]",
        className,
      )}
      style={{ ["--shiny-duration" as string]: `${duration}s` }}
    >
      {children}
    </span>
  );
}
