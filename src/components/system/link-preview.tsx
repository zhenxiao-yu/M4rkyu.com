"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";

interface LinkPreviewProps {
  /** Title displayed in the preview card. */
  title: string;
  /** One- or two-line lede shown below the title. */
  lede?: string;
  /** Optional cover image. Falls back to PlaceholderImage when omitted. */
  image?: { src: string; alt: string };
  /** Optional eyebrow / metadata line above the title. */
  eyebrow?: string;
  /** Optional placeholder label for the fallback image. */
  placeholderLabel?: string;
  /** Side preference for the preview, forwarded to Radix. */
  side?: "top" | "right" | "bottom" | "left";
  /** Tooltip alignment, forwarded to Radix. */
  align?: "start" | "center" | "end";
  /** The trigger content — usually a `<Link>` wrapping a title. */
  children: ReactNode;
}

/**
 * Hover/focus-triggered preview for archive links. Wraps Radix
 * Tooltip with a richer content card (cover + eyebrow + title +
 * lede). Touch devices skip the preview by Radix default.
 *
 * The trigger is `asChild` so the visible link/title element
 * stays the focusable / clickable target — the preview only
 * adds the hover affordance.
 */
export function LinkPreview({
  title,
  lede,
  image,
  eyebrow,
  placeholderLabel = "FRAME TBD",
  side = "right",
  align = "start",
  children,
}: LinkPreviewProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className="w-72 rounded-lg border-border bg-popover p-0 text-popover-foreground shadow-lg"
      >
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-t-lg bg-muted">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="288px"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage
              label={placeholderLabel}
              aspect="h-full"
              className="rounded-none border-0"
            />
          )}
        </div>
        <div className="grid gap-1.5 p-3">
          {eyebrow ? (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <p className="text-sm font-semibold leading-snug text-foreground">
            {title}
          </p>
          {lede ? (
            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {lede}
            </p>
          ) : null}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
