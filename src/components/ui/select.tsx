"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn, FOCUS_RING } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm transition-[border-color,background-color,box-shadow] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 data-placeholder:text-muted-foreground data-[state=open]:border-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        FOCUS_RING,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={sideOffset}
        collisionPadding={12}
        className={cn(
          // Frame the menu. Width follows the trigger but allows a
          // small enlargement so descriptive two-line items don't get
          // crushed by a narrow trigger.
          "z-50 min-w-(--radix-select-trigger-width) max-w-[min(28rem,calc(100vw-1.5rem))] max-h-(--radix-select-content-available-height) overflow-hidden rounded-xl border border-border/80 bg-popover/95 text-popover-foreground shadow-2xl shadow-black/20 backdrop-blur-xl dark:shadow-black/50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          className,
        )}
        {...props}
      >
        {/* The Viewport is the scroll container. We cap it to the
         * available content height and let the OS scrollbar (already
         * themed site-wide in globals.css) handle long option lists. */}
        <SelectPrimitive.Viewport
          data-lenis-prevent
          className="max-h-(--radix-select-content-available-height) overflow-y-auto overscroll-contain p-1.5"
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// Optional eyebrow header above a group of items. Pure visual — does
// not participate in keyboard navigation.
export function SelectSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pb-1 pt-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </div>
  );
}

interface SelectItemProps
  extends React.ComponentProps<typeof SelectPrimitive.Item> {
  /** Lucide icon (or any ReactNode) rendered in a small leading column. */
  icon?: ReactNode;
  /** One-line secondary text rendered below the label. */
  description?: ReactNode;
  /** Right-aligned trailing slot, e.g. a count chip. Falls behind the check indicator when an item is selected. */
  trailing?: ReactNode;
}

export function SelectItem({
  className,
  children,
  icon,
  description,
  trailing,
  ...props
}: SelectItemProps) {
  const hasDescription = !!description;
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-start gap-2.5 rounded-md px-2.5 py-2 text-sm outline-none transition-colors duration-(--motion-fast) ease-(--ease-premium) data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground data-[state=checked]:text-foreground",
        hasDescription ? "min-h-[3rem]" : "min-h-9 items-center",
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md border border-border/60 bg-background/60 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) data-[state=checked]:border-ring/55 data-[state=checked]:text-foreground",
            hasDescription ? "mt-0.5" : "",
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <SelectPrimitive.ItemText asChild>
          <span className="block truncate font-medium leading-tight">
            {children}
          </span>
        </SelectPrimitive.ItemText>
        {hasDescription ? (
          <span className="mt-0.5 block text-[0.7rem] leading-snug text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className="ml-auto shrink-0 self-center font-mono text-[0.65rem] tabular-nums text-muted-foreground">
          {trailing}
        </span>
      ) : null}
      <SelectPrimitive.ItemIndicator asChild>
        <Check
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-ring",
            hasDescription ? "mt-1" : "self-center",
          )}
        />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
