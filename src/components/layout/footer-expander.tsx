"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Footer expander — keeps the resting footer a slim band. The tall sections
 * (invitation, newsletter, sitemap, scene-floor wordmark) collapse behind a
 * single toggle that defaults to closed, so every page ends on a compact rail
 * the reader can open on demand. The toggle sits at the footer's top edge, so
 * the hairline reads as a deliberate handle rather than a stray divider.
 *
 * Height animates via the grid-rows `0fr → 1fr` trick (no JS measurement, no
 * layout thrash); reduced motion snaps. Closed content is `inert`, so it leaves
 * the tab order and the accessibility tree until opened.
 */
export function FooterExpander({
  children,
  expandLabel,
  collapseLabel,
}: {
  children: ReactNode;
  expandLabel: string;
  collapseLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-center py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:text-foreground",
            FOCUS_RING,
          )}
        >
          <StarGlyph className="size-2.5 text-ring" />
          {open ? collapseLabel : expandLabel}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 transition-transform duration-(--motion-base) ease-(--ease-premium)",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-(--motion-medium) ease-(--ease-premium) motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          {children}
        </div>
      </div>
    </div>
  );
}
