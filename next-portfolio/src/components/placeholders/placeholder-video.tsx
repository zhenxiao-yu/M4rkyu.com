import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentPendingLabel } from "./content-pending-label";

export function PlaceholderVideo({
  label = "VIDEO POSTER TBD",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative aspect-video overflow-hidden rounded-md border bg-card",
        className,
      )}
    >
      <div className="absolute inset-0 bg-cyber-grid opacity-45" aria-hidden="true" />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid place-items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full border bg-background/70">
            <Play className="ml-0.5 size-5" aria-hidden="true" />
          </span>
          <ContentPendingLabel label={label} />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        <span>00:00</span>
        <span className="h-px flex-1 bg-foreground/20" />
        <span>draft cut</span>
      </div>
    </div>
  );
}
