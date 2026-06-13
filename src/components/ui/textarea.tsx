import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared multiline text field — the textarea counterpart to `Input`. Prose
 * forms (contact, comments, account, admin) should compose this instead of
 * hand-rolling a `<textarea>` so the border / focus ring / spacing stay
 * consistent. `text-base` on mobile keeps iOS from auto-zooming on focus
 * (the global `(pointer: coarse)` floor in globals.css is the catch-all for
 * the bespoke monospace tool editors that don't use this primitive).
 */
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
