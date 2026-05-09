import { cn } from "@/lib/utils";
import { ContentPendingLabel } from "./content-pending-label";

export function PlaceholderImage({
  label = "MEDIA TBD",
  aspect = "aspect-16/10",
  className,
}: {
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted",
        aspect,
        className,
      )}
    >
      <div className="absolute inset-0 contact-sheet opacity-40" aria-hidden="true" />
      <div className="placeholder-noise absolute inset-0 opacity-80" aria-hidden="true" />
      <div className="absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>frame</span>
        <span>draft</span>
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <ContentPendingLabel label={label} />
      </div>
      <div className="absolute bottom-4 left-4 right-4 h-px bg-foreground/20" aria-hidden="true" />
    </div>
  );
}
