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
  default: "max-w-7xl",
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
      className={cn(tone === "muted" && "border-y bg-muted/20", className)}
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
