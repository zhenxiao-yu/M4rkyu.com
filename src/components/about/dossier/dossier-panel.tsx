import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DossierPanelProps {
  /** Decorative field index, e.g. "FIELD 02" — aria-hidden in the heading. */
  fieldNo: string;
  /** The section name — becomes the panel's <h2> (the accessible heading). */
  label: string;
  /** Optional human title under the field tab (rendered as text, not a heading). */
  title?: string;
  /** Optional one-line description under the title. */
  subhead?: string;
  /**
   * `glass` — translucent surface that lets the file scanline read through.
   * `plain` — opaque warm card, used for the prose beats so they carry no
   * texture (warmth = restraint).
   */
  tone?: "glass" | "plain";
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * One labelled section of the dossier: a pixel "FIELD 0n // LABEL" tab ruled
 * across to a corner tick, an optional human title + subhead, then a surface
 * body. Exactly one heading (`label`) per panel keeps the document outline
 * sequential under the page H1.
 */
export function DossierPanel({
  fieldNo,
  label,
  title,
  subhead,
  tone = "glass",
  className,
  bodyClassName,
  children,
}: DossierPanelProps) {
  return (
    <section className={cn("relative", className)}>
      {/* Field tab — pixel HUD index + label. fieldNo + "//" are decorative;
          only the label contributes the heading's accessible name. */}
      <div className="mb-2.5 flex items-center gap-3">
        <h2 className="flex items-baseline gap-2 font-pixel text-base uppercase leading-none tracking-[0.1em] sm:text-lg">
          <span aria-hidden="true" className="text-foreground/40">
            {fieldNo}
          </span>
          <span aria-hidden="true" className="text-ring">
            {"//"}
          </span>
          <span className="text-foreground">{label}</span>
        </h2>
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-linear-to-r from-border to-transparent"
        />
        <span
          aria-hidden="true"
          className="size-2 shrink-0 border-r border-t border-hud-muted/45"
        />
      </div>

      {title ? (
        <p className="max-w-2xl text-balance font-display text-xl font-semibold leading-snug sm:text-2xl">
          {title}
        </p>
      ) : null}
      {subhead ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
          {subhead}
        </p>
      ) : null}

      <div
        className={cn(
          "relative mt-3.5 overflow-hidden rounded-lg p-5 sm:p-6",
          tone === "glass"
            ? "glass-surface glass-interactive"
            : "border bg-card",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
