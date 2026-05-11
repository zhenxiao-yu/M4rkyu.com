"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Tone = "live" | "now" | "info";
type Size = "sm" | "md";

const DOT_CLASS: Record<Tone, string> = {
  live: "bg-signal",
  now: "bg-success",
  info: "bg-muted-foreground",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "size-1.5",
  md: "size-2",
};

interface StatusPulseProps {
  /** "live" and "now" pulse; "info" stays static. */
  tone?: Tone;
  size?: Size;
  className?: string;
}

/**
 * Small live / now / info indicator. The halo ring animates via the
 * `pulse-halo` keyframe in `globals.css`. Under reduced-motion the
 * halo is skipped entirely (via `useReducedMotion()`) and only the
 * steady dot renders. Always render this inside an outer element
 * that carries the semantic role+aria-live (e.g. SystemBadge) — the
 * pulse itself is purely decorative.
 */
export function StatusPulse({
  tone = "info",
  size = "sm",
  className,
}: StatusPulseProps) {
  const reduceMotion = useReducedMotion();
  const dotColor = DOT_CLASS[tone];
  const animates = tone !== "info" && !reduceMotion;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0",
        SIZE_CLASS[size],
        className,
      )}
    >
      {animates ? (
        <span
          className={cn("absolute inset-0 rounded-full opacity-0", dotColor)}
          style={{
            animation:
              "pulse-halo var(--motion-cinematic) var(--ease-premium) infinite",
          }}
        />
      ) : null}
      <span
        className={cn(
          "relative inline-block size-full rounded-full",
          dotColor,
        )}
      />
    </span>
  );
}
