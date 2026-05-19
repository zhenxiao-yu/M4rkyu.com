"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { BentoCard } from "@/components/ui/magic/bento-grid";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { GalleryItem } from "@/content/schemas";

interface GalleryBentoTileProps {
  item: GalleryItem;
  span?: string;
}

/**
 * Bento cell wrapping a gallery frame. The whole cell is a Link to
 * the gallery deep-link (?frame=<slug>) so visitors land in the
 * lightbox. Image grayscales on rest, regains color on hover —
 * matches the existing GalleryGrid thumbnail behavior.
 */
export function GalleryBentoTile({ item, span }: GalleryBentoTileProps) {
  const t = useTranslations("Gallery");
  return (
    <BentoCard span={span} className="p-0">
      <Link
        href={`/archive?frame=${item.slug}`}
        aria-label={t("openFrame", { title: item.title })}
        className={cn("relative flex h-full flex-col", FOCUS_RING)}
      >
        <div className="relative flex-1 overflow-hidden bg-muted">
          {item.src ? (
            <Image
              src={item.src.src}
              alt={item.src.alt}
              fill
              sizes="(min-width: 1024px) 33vw, 50vw"
              className={cn(
                "object-cover grayscale transition duration-300",
                "group-hover:scale-[1.02] group-hover:grayscale-0",
              )}
            />
          ) : (
            <PlaceholderImage
              label={t("frameTbd")}
              aspect="h-full"
              className="rounded-none border-0"
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t bg-card/95 px-4 py-3">
          <span className="line-clamp-1 text-sm font-medium text-foreground">
            {item.title}
          </span>
          <Badge variant="outline" className="shrink-0 text-[0.6rem]">
            {item.type}
          </Badge>
        </div>
      </Link>
    </BentoCard>
  );
}
