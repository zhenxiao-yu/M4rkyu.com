"use client";

import { type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn, FOCUS_RING } from "@/lib/utils";

// Wraps one row in dnd-kit's sortable wiring and hands the drag bindings to
// its render-prop child, keeping the (large) row markup inline in the map
// rather than threading every handler through props.
export function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (props: {
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    handleProps: Record<string, unknown>;
    isDragging: boolean;
  }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };
  return children({
    setNodeRef,
    style,
    handleProps: { ...attributes, ...listeners },
    isDragging,
  });
}

export function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}
