"use client";

import { useCallback, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Badge } from "@/components/ui/badge";
import { BlurImage } from "@/components/ui/blur-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryItem } from "@/content/schemas";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { GalleryActions } from "./gallery-actions";
import { FrameMedia, FAST_GLASS_BUTTON } from "./gallery-frame-media";

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
  }, [isOpen, items.length, next, prev, setIndex]);

  // Each related entry is paired with its original gallery index so we can
  // render the curator "PLATE NN" overlay without re-scanning the items
  // array per thumb in render.
  const related = useMemo(() => {
    if (!current) return [] as { item: GalleryItem; index: number }[];
    const explicit = current.related
      .map((slug) => items.find((item) => item.slug === slug))
      .filter((item): item is GalleryItem => Boolean(item));
    const fallback =
      explicit.length >= 3
        ? []
        : items.filter(
            (item) =>
              item.collection === current.collection &&
              item.slug !== current.slug &&
              !explicit.some((entry) => entry.slug === item.slug),
          );
    return [...explicit, ...fallback]
      .slice(0, 3)
      .map((item) => ({
        item,
        index: items.findIndex((entry) => entry.slug === item.slug),
      }));
  }, [current, items]);

  const plateLabel = tGallery("plate");
  const plateIndex = String(openIndex + 1).padStart(2, "0");
  const plateTotal = String(items.length).padStart(2, "0");

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onChange(null);
      }}
    >
      <DialogContent
        hideCloseButton
        className={cn(
          "left-0 top-0 z-60 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-background/98 p-0",
          "sm:left-1/2 sm:top-1/2 sm:h-[min(92vh,58rem)] sm:w-[calc(100vw-1.5rem)] sm:max-w-[88rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.5rem] sm:border",
        )}
      >
        {current ? (
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="border-b border-border/70 px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{current.type}</Badge>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {openIndex + 1} / {items.length}
                    </span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      {current.collection}
                    </span>
                  </div>
                  <DialogTitle className="text-balance text-base sm:text-lg">
                    {current.title}
                  </DialogTitle>
                  <DialogDescription className="mt-1 max-w-2xl text-xs leading-5 sm:text-sm">
                    {current.caption}
                  </DialogDescription>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  aria-label={tGallery("closeDetail")}
                  className={cn(
                    "mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full sm:size-10",
                    FAST_GLASS_BUTTON,
                    FOCUS_RING,
                  )}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.4fr)_24rem]">
              <section className="relative min-h-[20rem] border-b border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] lg:border-b-0 lg:border-r">
                <FrameMedia
                  key={current.slug}
                  item={current}
                  plateLabel={plateLabel}
                  plateIndex={plateIndex}
                  plateTotal={plateTotal}
                  mediaTbdLabel={tGallery("lightboxMediaTbd")}
                  zoomInLabel={tGallery("zoomIn")}
                  zoomOutLabel={tGallery("zoomOut")}
                  viewDetailLabel={tGallery("viewDetail")}
                  closeDetailLabel={tGallery("closeDetail")}
                  placeholderHint={tGallery("placeholderHint")}
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background via-background/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-6">
                  <Button
                    onClick={prev}
                    aria-label={tGallery("previousFrame")}
                    type="button"
                    size="icon"
                    variant="outline"
                    className={cn(
                      "size-11 rounded-full border-0 bg-transparent sm:size-9",
                      FAST_GLASS_BUTTON,
                    )}
                  >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                  </Button>

                  <div className="hidden items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:flex">
                    <kbd className="rounded border border-border/70 bg-background/75 px-1.5 py-0.5">
                      ←
                    </kbd>
                    <kbd className="rounded border border-border/70 bg-background/75 px-1.5 py-0.5">
                      →
                    </kbd>
                    <span>{tGallery("hoverHint")}</span>
                  </div>

                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground sm:hidden">
                    {openIndex + 1} / {items.length}
                  </span>

                  <Button
                    onClick={next}
                    aria-label={tGallery("nextFrame")}
                    type="button"
                    size="icon"
                    variant="outline"
                    className={cn(
                      "size-11 rounded-full border-0 bg-transparent sm:size-9",
                      FAST_GLASS_BUTTON,
                    )}
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </section>

              <aside
                data-lenis-prevent
                className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5"
              >
                <div className="grid gap-5">
                  {/* Wall label — a curator's plate caption. Vertical ring-tinted
                   * hairline rule on the left does the visual heavy lifting, the
                   * pixel-font plate index ties this panel to the typographic
                   * mark in the main viewing area. */}
                  <div className="relative rounded-[1.25rem] border border-border/70 bg-card/70 p-5 pl-6 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-5 bottom-5 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent"
                    />
                    <div className="grid gap-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                          {tGallery("detailView")}
                        </p>
                        <span
                          aria-hidden="true"
                          className="font-pixel text-base leading-none text-foreground/75 tabular-nums"
                        >
                          {plateIndex}
                          <span className="mx-0.5 text-muted-foreground/50">
                            /
                          </span>
                          {plateTotal}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {tGallery("detailHint")}
                      </p>
                      {current.location || current.capturedAt ? (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                          {current.location ? (
                            <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                              {current.location}
                            </span>
                          ) : null}
                          {current.capturedAt ? (
                            <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em]">
                              {current.capturedAt}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {current.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {current.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[0.65rem]"
                        >
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

                  {related.length > 0 ? (
                    <div className="grid gap-3 border-t border-border/70 pt-5">
                      <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                        {tGallery("fromCollection")}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {related.map(({ item, index: relatedIndex }, position) => (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => onChange(item.slug)}
                            className={cn(
                              "group text-left",
                              FOCUS_RING_INSET,
                            )}
                            aria-label={tGallery("openFrame", {
                              title: item.title,
                            })}
                          >
                            <div
                              className={cn(
                                "relative overflow-hidden rounded-lg border border-border/70 bg-muted",
                                !(item.src?.width && item.src?.height) &&
                                  aspectClass(item.aspect),
                              )}
                              style={
                                item.src?.width && item.src?.height
                                  ? {
                                      aspectRatio: `${item.src.width} / ${item.src.height}`,
                                    }
                                  : undefined
                              }
                            >
                              {item.src ? (
                                <BlurImage
                                  src={item.src.src}
                                  alt={item.src.alt}
                                  fill
                                  sizes="(min-width: 1024px) 220px, 42vw"
                                  loading={position < 3 ? "eager" : "lazy"}
                                  placeholder={
                                    item.src.blurDataURL ? "blur" : undefined
                                  }
                                  blurDataURL={item.src.blurDataURL}
                                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <PlaceholderImage
                                  label={tGallery("frameTbd")}
                                  aspect="h-full"
                                  className="rounded-none border-0"
                                />
                              )}
                              {relatedIndex >= 0 ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute left-2 top-2 z-10 rounded bg-background/85 px-1.5 py-0.5 font-pixel text-xs leading-none text-foreground/85 tabular-nums backdrop-blur-sm"
                                >
                                  {String(relatedIndex + 1).padStart(2, "0")}
                                </span>
                              ) : null}
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
              </aside>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
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
