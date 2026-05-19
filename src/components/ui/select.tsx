"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
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
          // Frame the menu. Width matches the trigger; height clamps to
          // whatever the viewport has room for so the inner viewport
          // always has somewhere to scroll into.
          "z-50 w-(--radix-select-trigger-width) max-h-(--radix-select-content-available-height) overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg shadow-black/10 dark:shadow-black/40",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          className,
        )}
        {...props}
      >
        {/* The Viewport is the scroll container. Radix defaults to
         * overflow:hidden + scroll-up/down buttons; we cap it to the
         * available content height and let the OS scrollbar (already
         * themed site-wide in globals.css) handle long option lists. */}
        <SelectPrimitive.Viewport
          className="max-h-(--radix-select-content-available-height) overflow-y-auto overscroll-contain p-1"
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "relative flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors duration-(--motion-fast) ease-(--ease-premium) data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-muted data-highlighted:text-foreground data-[state=checked]:text-foreground",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText asChild>
        <span className="flex-1 truncate">{children}</span>
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator asChild>
        <Check
          aria-hidden="true"
          className="size-4 shrink-0 text-foreground"
        />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
