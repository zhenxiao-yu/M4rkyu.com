import { cn } from "@/lib/utils";

export function ContentPendingLabel({
  label = "CONTENT PENDING",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border bg-background/70 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
