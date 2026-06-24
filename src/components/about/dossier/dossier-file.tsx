import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The outer "folder" frame for the About dossier. A relative stack that
 * lays its sections out vertically over a faint scanline texture and four
 * registration ticks — the chrome that makes the page read as one
 * classified file rather than a loose pile of cards.
 *
 * The scanline is decorative (aria-hidden) and sits *behind* the
 * translucent glass panels, so it reads through them subtly and vanishes
 * entirely under `prefers-reduced-transparency` (the panels turn opaque).
 * No motion of its own.
 */
export function DossierFile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Document texture — terminal scanlines unifying every panel. */}
      <span
        aria-hidden="true"
        className="scanline-layer pointer-events-none absolute inset-0 opacity-50"
      />
      {/* Registration ticks — bracket the file as a HUD document (sm+ only
          so phones stay uncluttered). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
      >
        <span className="absolute -left-2 -top-2 size-3 border-l border-t border-hud-muted/45" />
        <span className="absolute -right-2 -top-2 size-3 border-r border-t border-hud-muted/45" />
        <span className="absolute -bottom-2 -left-2 size-3 border-b border-l border-hud-muted/45" />
        <span className="absolute -bottom-2 -right-2 size-3 border-b border-r border-hud-muted/45" />
      </span>

      {/* Content rides above the texture (positioned + later in DOM). */}
      <div className="relative flex flex-col gap-6 sm:gap-8">{children}</div>
    </div>
  );
}
