"use client";

import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING } from "@/lib/utils";

// Shared gallery frame tile — used by the landing rails (variant "card")
// and the collection masonry (variant "bare"). Clicking opens the
// lightbox via the parent's `onOpen`. Images desaturate at rest and
// return to colour on hover (pointer-fine sticky-hover is benign on
// touch). The whole artwork is shown uncropped because the tile box
// matches the item's aspect ratio, so object-cover fills without
// cropping.

export interface FrameTileProps {
  item: GalleryItem;
  saved: boolean;
  onOpen: () => void;
  openLabel: string;
  frameTbdLabel: string;
  featuredLabel: string;
  savedLabel: string;
  /** "card" = image + caption footer; "bare" = image with hover caption overlay. */
  variant?: "card" | "bare";
  /** next/image sizes hint. */
  sizes?: string;
}

export function FrameTile({
  item,
  saved,
  onOpen,
  openLabel,
  frameTbdLabel,
  featuredLabel,
  savedLabel,
  variant = "card",
  sizes = "(min-width: 1024px) 25vw, 50vw",
}: FrameTileProps) {
  const isDimmed = item.status === "coming-soon" || item.status === "draft";
  const aspect = aspectClass(item.aspect);
  const hasImage = Boolean(item.src);
  // Prefer the image's true ratio (captured at upload) over the coarse
  // `aspect` enum so the box reserves exactly the right space — no crop,
  // zero layout shift. Falls back to the enum for legacy/static items.
  const ratio =
    item.src?.width && item.src?.height
      ? `${item.src.width} / ${item.src.height}`
      : undefined;

  return (
    <button
      onClick={onOpen}
      type="button"
      aria-label={openLabel}
      className={cn(
        "group relative block w-full overflow-hidden rounded-md border border-border bg-card/80 text-left transition-[border-color,box-shadow,transform] duration-(--motion-base) ease-(--ease-premium) hover:border-ring hover:shadow-md motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
        isDimmed && "opacity-80",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          !ratio && aspect,
          variant === "card" && "border-b",
        )}
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {hasImage && item.src ? (
          <BlurImage
            src={item.src.src}
            alt={item.src.alt}
            fill
            sizes={sizes}
            placeholder={item.src.blurDataURL ? "blur" : undefined}
            blurDataURL={item.src.blurDataURL}
            className="object-cover [@media(pointer:fine)]:grayscale transition duration-300 group-hover:scale-[1.02] [@media(pointer:fine)]:group-hover:grayscale-0"
          />
        ) : (
          <PlaceholderImage
            label={frameTbdLabel}
            aspect={aspect}
            className="rounded-none border-0"
          />
        )}

        {saved ? (
          <span
            aria-label={savedLabel}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-sm border border-ring/60 bg-background/85 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground backdrop-blur-sm"
          >
            <Bookmark aria-hidden="true" className="size-2.5 fill-ring text-ring" />
            {savedLabel}
          </span>
        ) : null}

        {/* Bare variant: caption + type ride a gradient revealed on hover. */}
        {variant === "bare" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-background/90 via-background/40 to-transparent px-3 py-2.5 opacity-0 transition-opacity duration-(--motion-base) ease-(--ease-premium) group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <span className="truncate text-xs font-semibold text-foreground">
              {item.title}
            </span>
            {item.featured ? (
              <Badge variant="signal" className="shrink-0 text-[0.55rem]">
                {featuredLabel}
              </Badge>
            ) : null}
          </div>
        ) : (item.capturedAt || item.location) && hasImage ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-background/85 via-background/40 to-transparent px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity duration-(--motion-base) ease-(--ease-premium) group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {item.location ? <span className="truncate">{item.location}</span> : <span />}
            {item.capturedAt ? <span className="shrink-0 tabular-nums">{item.capturedAt}</span> : null}
          </div>
        ) : null}
      </div>

      {variant === "card" ? (
        <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[0.6rem] uppercase tracking-[0.18em]">
              {item.type}
            </Badge>
            {item.featured ? (
              <Badge variant="signal" className="text-[0.6rem]">
                {featuredLabel}
              </Badge>
            ) : null}
          </div>
          <span className="text-sm font-semibold leading-tight text-foreground">
            {item.title}
          </span>
        </div>
      ) : null}
    </button>
  );
}

export function aspectClass(aspect: GalleryItem["aspect"]): string {
  switch (aspect) {
    case "1/1":
      return "aspect-square";
    case "3/4":
      return "aspect-3/4";
    case "2/3":
      return "aspect-2/3";
    case "16/9":
      return "aspect-16/9";
    case "21/9":
      return "aspect-21/9";
    case "4/5":
    default:
      return "aspect-4/5";
  }
}

// Item ordering shared by the grid + masonry: pinned first, then
// featured, then source order.
export function orderFrames(items: GalleryItem[]): GalleryItem[] {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return 0;
  });
}
