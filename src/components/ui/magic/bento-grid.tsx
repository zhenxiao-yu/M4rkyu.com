// Adapted from Magic UI · BentoGrid · sprint-2 phase 2.2

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /**
   * Tailwind grid-row / grid-col span helpers (e.g. "md:row-span-2 md:col-span-2").
   * Optional — default cells fill one row × one col.
   */
  span?: string;
}

/**
 * Editorial bento grid. Renders a 2-col / 3-col responsive grid of
 * cards. Each cell can opt into a row/col span via the `span` prop on
 * `BentoCard`. Tokenized: cells use `border-border`, `bg-card`, hover
 * transitions through `--motion-fast` / `--ease-premium`.
 *
 * Per docs/UI_LIBRARY_STRATEGY.md §11, no atmospheric background is
 * applied to the bento itself; the surrounding section owns mood.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid auto-rows-[14rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({ children, className, span }: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
        span,
        className,
      )}
    >
      {children}
    </div>
  );
}
