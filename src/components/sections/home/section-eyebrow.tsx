import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The canonical home-section eyebrow — small mono caps above a heading.
 *
 * One source of truth so the section-header label can't re-drift across
 * sessions. `HomeSection` renders this for its built-in `eyebrow` prop;
 * sections that hand-roll a custom header layout (Compass, About preview,
 * Closing CTA) compose it directly so every section shares the exact same
 * treatment instead of re-typing the class string. Mirrors the intent of
 * `SectionActionLink`, which already centralized the "→ open" link for the
 * same reason.
 */
export function SectionEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
