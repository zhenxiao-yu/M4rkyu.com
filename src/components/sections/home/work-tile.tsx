"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface WorkTileProps {
  slug: string;
  title: string;
  pitch: string;
  cover?: { src: string; alt: string };
  status: "ready" | "draft" | "placeholder";
  category: string;
  year: string;
  locale: Locale;
  /** Slot offset, used for tile placement within the sticky frame. */
  slot: { x: string; y: string; w: string; rotate: number };
}

/**
 * Single tile inside the SelectedWork sticky-parallax showcase. Tiles
 * are positioned absolutely within the pinned frame and rotated in 3D
 * based on scroll progress (driven from the parent via the `position`
 * CSS var). Ready tiles link to their detail; draft tiles show a
 * "DRAFT" badge and don't link.
 */
export function WorkTile({
  slug,
  title,
  pitch,
  cover,
  status,
  category,
  year,
  locale,
  slot,
}: WorkTileProps) {
  const isReady = status === "ready";

  const inner = (
    <article
      style={
        {
          left: slot.x,
          top: slot.y,
          width: slot.w,
          "--tile-rotate": `${slot.rotate}deg`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute aspect-4/5 overflow-hidden rounded-lg border bg-card shadow-xl shadow-black/20 transition-[opacity,transform] duration-(--motion-base) ease-(--ease-premium)",
        // --scroll-progress is set on the pinned parent and inherits down
        // to here; tiles rotate Y and translate based on scroll. The
        // fallback `0` keeps the tiles flat before ScrollTrigger boots
        // (also the reduced-motion / mobile path).
        "transform-[rotateY(calc(var(--scroll-progress,0)*-18deg))_translate3d(0,calc(var(--scroll-progress,0)*-32px),0)_rotate(var(--tile-rotate))]",
        "transform-3d",
        isReady ? "opacity-100" : "opacity-50 grayscale",
      )}
    >
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-muted">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            cover · tbd
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/70 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[0.55rem] tracking-[0.2em]">
            {year}
          </Badge>
          <Badge variant="outline" className="font-mono text-[0.55rem] tracking-[0.2em]">
            {category}
          </Badge>
          {!isReady ? (
            <Badge variant="warning" className="ml-auto font-mono text-[0.55rem] tracking-[0.2em]">
              draft
            </Badge>
          ) : (
            <ArrowUpRight aria-hidden="true" className="ml-auto size-4 text-foreground" />
          )}
        </div>
        <h3 className="mt-2 text-base font-semibold leading-tight">{title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">{pitch}</p>
      </div>
    </article>
  );

  if (!isReady) return inner;
  return (
    <Link
      href={`/work/${slug}`}
      locale={locale}
      className="block focus-visible:outline-none [&:focus-visible_article]:ring-2 [&:focus-visible_article]:ring-ring"
    >
      {inner}
    </Link>
  );
}
