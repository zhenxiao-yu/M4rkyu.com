import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageSectionWidth = "default" | "narrow";

interface PageSectionProps {
  children: ReactNode;
  tone?: "default" | "muted";
  width?: PageSectionWidth;
  className?: string;
  innerClassName?: string;
}

const widthClass: Record<PageSectionWidth, string> = {
  default: "max-w-page",
  narrow: "max-w-5xl",
};

export function PageSection({
  children,
  tone = "default",
  width = "default",
  className,
  innerClassName,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        // Soft vertical wash for the "muted" rhythm instead of a hard
        // `border-y` + flat tint — the old treatment drew a visible
        // horizontal contrast seam where the band met the sections above and
        // below (most obvious on wide screens). The tint now fades from
        // transparent at both edges, so the section still reads as its own
        // stage without an edge line.
        tone === "muted" &&
          "bg-linear-to-b from-transparent via-muted/15 to-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto w-full px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20",
          widthClass[width],
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
