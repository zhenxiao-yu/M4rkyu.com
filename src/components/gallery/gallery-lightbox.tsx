"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { GalleryActions } from "./gallery-actions";

interface GalleryLightboxProps {
  items: GalleryItem[];
  openSlug: string | null;
  locale: string;
  onChange: (slug: string | null) => void;
  /** Server-resolved set of slugs the current user has saved. */
  savedSlugs: Set<string>;
  signedIn: boolean;
}

export function GalleryLightbox({
  items,
  openSlug,
  locale,
  onChange,
  savedSlugs,
  signedIn,
}: GalleryLightboxProps) {
  const tGallery = useTranslations("Gallery");
  const openIndex = openSlug
    ? items.findIndex((item) => item.slug === openSlug)
    : -1;
  const isOpen = openIndex >= 0;
  const current = isOpen ? items[openIndex] : null;

  const setIndex = useCallback(
    (index: number | null) => {
      if (index === null) {
        onChange(null);
        return;
      }
      const item = items[index];
      if (!item) return;
      onChange(item.slug);
    },
    [items, onChange],
  );

  const prev = useCallback(() => {
    if (!isOpen) return;
    setIndex((openIndex - 1 + items.length) % items.length);
  }, [isOpen, items.length, openIndex, setIndex]);

  const next = useCallback(() => {
    if (!isOpen) return;
    setIndex((openIndex + 1) % items.length);
  }, [isOpen, items.length, openIndex, setIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "ArrowLeft") prev();
      else if (event.key === "ArrowRight") next();
      else if (event.key === "Home") setIndex(0);
      else if (event.key === "End") setIndex(items.length - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, prev, next, items.length, setIndex]);

  const related = useMemo(() => {
    if (!current) return [] as GalleryItem[];
    const explicit = current.related
      .map((slug) => items.find((item) => item.slug === slug))
      .filter((item): item is GalleryItem => Boolean(item));
    if (explicit.length >= 3) return explicit.slice(0, 3);
    const fallback = items.filter(
      (item) =>
        item.collection === current.collection &&
        item.slug !== current.slug &&
        !explicit.some((entry) => entry.slug === item.slug),
    );
    return [...explicit, ...fallback].slice(0, 3);
  }, [current, items]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onChange(null);
      }}
    >
      <DialogContent className="max-w-4xl gap-5 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="truncate text-base sm:text-lg">
                {current?.title ?? ""}
              </DialogTitle>
              <DialogDescription className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.2em]">
                {isOpen ? `${openIndex + 1} / ${items.length}` : ""}
                {current?.collection ? ` · ${current.collection}` : ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {current ? (
          <div className="grid gap-5 px-5 pb-5">
            <FrameMedia
              item={current}
              mediaTbdLabel={tGallery("lightboxMediaTbd")}
              zoomInLabel={tGallery("zoomIn")}
              zoomOutLabel={tGallery("zoomOut")}
            />

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{current.type}</Badge>
              {current.location ? (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                  {current.location}
                </span>
              ) : null}
              {current.capturedAt ? (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">
                  {current.capturedAt}
                </span>
              ) : null}
            </div>

            {current.caption ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {current.caption}
              </p>
            ) : null}

            {current.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {current.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[0.65rem]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <GalleryActions
              slug={current.slug}
              title={current.title}
              caption={current.caption}
              locale={locale}
              initialSaved={savedSlugs.has(current.slug)}
              signedIn={signedIn}
            />

            <div className="flex items-center justify-between border-t pt-4">
              <Button
                onClick={prev}
                aria-label={tGallery("previousFrame")}
                type="button"
                size="icon"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              {/* Keyboard hint — hidden on touch / small screens since
                * the arrow shortcuts don't apply there. Same pattern
                * as the command palette footer. */}
              <div className="hidden items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
                <kbd className="rounded border px-1.5 py-0.5">←</kbd>
                <kbd className="rounded border px-1.5 py-0.5">→</kbd>
                <span className="tabular-nums">
                  {openIndex + 1} / {items.length}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground sm:hidden">
                {openIndex + 1} / {items.length}
              </span>
              <Button
                onClick={next}
                aria-label={tGallery("nextFrame")}
                type="button"
                size="icon"
                variant="outline"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>

            {related.length > 0 ? (
              <div className="grid gap-3 border-t pt-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {tGallery("fromCollection")}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {related.map((item, index) => (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => onChange(item.slug)}
                      className={cn("group text-left", FOCUS_RING_INSET)}
                      aria-label={tGallery("openFrame", { title: item.title })}
                    >
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-md border bg-muted",
                          aspectClass(item.aspect),
                        )}
                      >
                        {item.src ? (
                          <Image
                            src={item.src.src}
                            alt={item.src.alt}
                            fill
                            sizes="(min-width: 768px) 220px, 33vw"
                            // First three thumbs are the most likely
                            // next-tap targets, so we don't lazy-load
                            // them — they're already on-screen when the
                            // lightbox opens.
                            loading={index < 3 ? "eager" : "lazy"}
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <PlaceholderImage
                            label={tGallery("frameTbd")}
                            aspect="h-full"
                            className="rounded-none border-0"
                          />
                        )}
                      </div>
                      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                        {item.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FrameMedia({
  item,
  mediaTbdLabel,
  zoomInLabel,
  zoomOutLabel,
}: {
  item: GalleryItem;
  mediaTbdLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("center");
  const aspect = aspectClass(item.aspect);

  if (!item.src) {
    return <PlaceholderImage label={mediaTbdLabel} aspect={aspect} />;
  }

  // Pan follows the cursor only when zoomed; mousemove never fires on
  // touch, so touch devices get a simple centred 2× view instead.
  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!zoomed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <div className={cn("group relative overflow-hidden rounded-md border bg-muted", aspect)}>
      <button
        type="button"
        aria-label={zoomed ? zoomOutLabel : zoomInLabel}
        aria-pressed={zoomed}
        onClick={() => setZoomed((value) => !value)}
        onMouseMove={handleMove}
        onMouseLeave={() => setOrigin("center")}
        className={cn(
          "absolute inset-0 size-full",
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
          FOCUS_RING_INSET,
        )}
      >
        <Image
          src={item.src.src}
          alt={item.src.alt}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className={cn(
            "object-contain",
            !reduceMotion &&
              "transition-transform duration-(--motion-medium) ease-(--ease-premium)",
          )}
          style={{
            transform: zoomed ? "scale(2)" : "scale(1)",
            transformOrigin: origin,
          }}
        />
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground backdrop-blur-sm"
      >
        {zoomed ? (
          <ZoomOut className="size-3.5" />
        ) : (
          <ZoomIn className="size-3.5" />
        )}
      </span>
    </div>
  );
}

function aspectClass(aspect: GalleryItem["aspect"]): string {
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
      return "aspect-[4/5]";
  }
}
