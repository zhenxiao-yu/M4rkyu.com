"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "@/content/schemas";

type Aspect = "1/1" | "3/2" | "4/5" | "16/9";

const ASPECT_CLASS: Record<Aspect, string> = {
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-video",
};

interface ArchiveTileProps {
  item: GalleryItem;
  /** Frame aspect ratio. Defaults to 4/5 (vertical photographic). */
  aspect?: Aspect;
  className?: string;
}

/**
 * Contact-sheet tile used in the homepage Creative Archive section
 * (Phase 5) and on /gallery in a later phase. The whole tile is a
 * deep-link into the lightbox via `?frame=<slug>`; image grayscales on
 * rest, regains color on hover. `bg-cyber-grid` shows through while
 * the image is loading so empty cells still feel intentional.
 */
export function ArchiveTile({
  item,
  aspect = "4/5",
  className,
}: ArchiveTileProps) {
  const t = useTranslations("Gallery");
  return (
    <BlurFade className={cn(className)}>
      <Link
        href={`/archive?frame=${item.slug}`}
        aria-label={t("openFrame", { title: item.title })}
        className="group block overflow-hidden rounded-sm border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-cyber-grid",
            ASPECT_CLASS[aspect],
          )}
        >
          {item.src ? (
            <Image
              src={item.src.src}
              alt={item.src.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover grayscale transition duration-(--motion-slow) ease-(--ease-premium) group-hover:scale-[1.02] group-hover:grayscale-0"
            />
          ) : (
            <PlaceholderImage
              label={t("frameTbd")}
              aspect="h-full"
              className="rounded-none border-0"
            />
          )}
        </div>
        {/* Spine chip — collection slug on the left, frame type on the right. */}
        <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card/90 px-3 py-2">
          <span className="line-clamp-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            {item.collection}
          </span>
          <Badge variant="outline" className="shrink-0 font-mono text-[0.6rem]">
            {item.type}
          </Badge>
        </div>
      </Link>
    </BlurFade>
  );
}
