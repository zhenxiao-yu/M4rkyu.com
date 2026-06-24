import { type ReactNode } from "react";
import { X } from "lucide-react";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

export function ActiveChip({
  label,
  onRemove,
  removeLabel,
}: {
  label: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 py-0.5 pl-2.5 pr-1 text-xs text-foreground">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${label}`}
        className={cn(
          "-mr-0.5 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground",
          FOCUS_RING_INSET,
        )}
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}

// Console "register" facet — a monospace tag with its global count. Active
// fills solid (monochrome, so the single --ring accent stays reserved);
// empty categories render disabled rather than as dead clicks.
export function FacetChip({
  label,
  count,
  active,
  disabled = false,
  onClick,
  icon,
}: {
  label: string;
  count?: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-[color,border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) motion-safe:active:scale-[0.97]",
        FOCUS_RING,
        disabled
          ? "cursor-not-allowed border-dashed border-border/60 text-muted-foreground/35"
          : active
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "tabular-nums",
            disabled
              ? "text-muted-foreground/35"
              : active
                ? "text-background/55"
                : "text-muted-foreground/50",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
