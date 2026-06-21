import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared interactive-focus ring — for standalone elements against the page background.
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Inset variant — no ring-offset; use inside dialogs, sheets, tabs, inline form fields.
export const FOCUS_RING_INSET =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Nested-surface recipes. The about/dossier cards had drifted into three
// different border-opacity + bg-token combos for the same two roles; these
// lock the canonical pair so the surfaces read identically and can't
// re-drift across sessions. Compose with `cn(PANEL_*, "<padding/layout>")`
// — keep padding per-site, and a per-site `rounded-*` / `bg-*` still wins
// via tailwind-merge.
//
//   WELL — a recessed grouping container that holds a set of items.
//   TILE — an individual item card nested inside a well.
export const PANEL_WELL = "rounded-md border border-border/60 bg-background/35";
export const PANEL_TILE = "rounded-md border border-border/50 bg-card/60";
