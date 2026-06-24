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
  width = "default",
  className,
  innerClassName,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        // No per-section background tint: the page background stays uniform
        // all the way down. The `tone` prop is kept on the interface for
        // callers but intentionally draws nothing now — the old "muted" wash
        // read as a horizontal divider band on tall pages.
        className,
      )}
    >
      <div
        className={cn(
          // Vertical rhythm + gutters keep scaling past `lg` so sections
          // breathe on 1920/2560 displays instead of stalling at py-14 while
          // the content measure sprawls. max-w-page itself is untouched.
          "mx-auto w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14 xl:px-10 xl:py-16 2xl:px-12 2xl:py-20",
          widthClass[width],
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
