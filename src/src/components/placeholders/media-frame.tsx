import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ContentPendingLabel } from "./content-pending-label";

export function MediaFrame({
  eyebrow = "EXHIBIT",
  label = "PLACEHOLDER",
  children,
  className,
}: {
  eyebrow?: string;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{eyebrow}</span>
        <ContentPendingLabel label={label} className="border-border/70 bg-transparent" />
      </div>
      <div className="p-3">{children}</div>
    </figure>
  );
}
