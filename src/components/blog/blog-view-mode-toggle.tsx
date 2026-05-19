"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import type { BlogViewMode } from "./use-view-mode";

interface BlogViewModeToggleProps {
  value: BlogViewMode;
  onChange: (next: BlogViewMode) => void;
  label: string;
  listLabel: string;
  gridLabel: string;
}

export function BlogViewModeToggle({
  value,
  onChange,
  label,
  listLabel,
  gridLabel,
}: BlogViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="hidden h-11 items-center gap-0.5 rounded-lg border border-border bg-background/70 p-1 sm:flex"
    >
      <ToggleButton
        active={value === "list"}
        onClick={() => onChange("list")}
        aria-label={listLabel}
      >
        <List aria-hidden="true" className="size-3.5" />
      </ToggleButton>
      <ToggleButton
        active={value === "grid"}
        onClick={() => onChange("grid")}
        aria-label={gridLabel}
      >
        <LayoutGrid aria-hidden="true" className="size-3.5" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children">) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "grid size-8 place-items-center rounded-md transition-[background-color,color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        FOCUS_RING_INSET,
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground motion-safe:hover:-translate-y-0.5",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
