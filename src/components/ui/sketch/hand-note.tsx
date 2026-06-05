import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HandNoteProps {
  children: ReactNode;
  className?: string;
  /** Degrees of tilt — a margin scribble is never perfectly level. */
  tilt?: number;
}

/**
 * A margin scribble — a casual handwritten aside in the warm-hand face,
 * tilted just off-level. The human voice annotating the cold machine:
 * jokes, asides, "ignore the mess", a note to self. Pair with <Scribble>
 * for an underline or arrow when it needs to point at something.
 */
export function HandNote({ children, className, tilt = -1.5 }: HandNoteProps) {
  return (
    <span
      className={cn(
        "inline-block font-hand text-lg leading-snug text-foreground/75",
        className,
      )}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      {children}
    </span>
  );
}

interface HandCaptionProps {
  children: ReactNode;
  className?: string;
}

/**
 * A small handwritten caption for a photo or figure — the line you'd
 * scrawl under a Polaroid. Quieter and lower-contrast than <HandNote>.
 */
export function HandCaption({ children, className }: HandCaptionProps) {
  return (
    <p
      className={cn(
        "font-hand text-lg leading-tight text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
