"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Info,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedGridPattern } from "@/components/ui/magic/animated-grid-pattern";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import type { GalleryItem } from "@/content/schemas";
import { SITE_URL } from "@/lib/seo/site";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { GalleryActions } from "./gallery-actions";

const FAST_GLASS_BUTTON = cn(
  "glass-surface glass-interactive text-muted-foreground hover:text-foreground",
  "transition-[transform,color,box-shadow,background-color,border-color] duration-(--motion-fast) ease-(--ease-premium)",
  "motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.96]",
);

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
                    "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                    FAST_GLASS_BUTTON,
                    FOCUS_RING,
                  )}
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </DialogHeader>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.4fr)_24rem]">
              <section className="relative min-h-[20rem] border-b border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] lg:border-b-0 lg:border-r">
                <FrameMedia
                  key={current.slug}
                  item={current}
                  mediaTbdLabel={tGallery("lightboxMediaTbd")}
                  zoomInLabel={tGallery("zoomIn")}
                  zoomOutLabel={tGallery("zoomOut")}
                  viewDetailLabel={tGallery("viewDetail")}
                  closeDetailLabel={tGallery("closeDetail")}
                  detailViewLabel={tGallery("detailView")}
                  detailHint={tGallery("detailHint")}
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
                      "rounded-full border-0 bg-transparent",
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
                      "rounded-full border-0 bg-transparent",
                      FAST_GLASS_BUTTON,
                    )}
                  >
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </section>

              <aside className="min-h-0 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                <div className="grid gap-5">
                  <div className="grid gap-3 rounded-[1.25rem] border border-border/70 bg-card/70 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {tGallery("detailView")}
                    </p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {tGallery("detailHint")}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                        {related.map((item, index) => (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => onChange(item.slug)}
                            className={cn("group text-left", FOCUS_RING_INSET)}
                            aria-label={tGallery("openFrame", {
                              title: item.title,
                            })}
                          >
                            <div
                              className={cn(
                                "relative overflow-hidden rounded-lg border border-border/70 bg-muted",
                                aspectClass(item.aspect),
                              )}
                            >
                              {item.src ? (
                                <Image
                                  src={item.src.src}
                                  alt={item.src.alt}
                                  fill
                                  sizes="(min-width: 1024px) 220px, 42vw"
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
              </aside>
            </div>
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
  viewDetailLabel,
  closeDetailLabel,
  detailViewLabel,
  detailHint,
  placeholderHint,
}: {
  item: GalleryItem;
  mediaTbdLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  viewDetailLabel: string;
  closeDetailLabel: string;
  detailViewLabel: string;
  detailHint: string;
  placeholderHint: string;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const [detailOpen, setDetailOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("center");

  const canZoom = Boolean(item.src);

  function clampZoom(next: number) {
    return Math.min(3, Math.max(1, Number(next.toFixed(2))));
  }

  function updateOrigin(event: React.MouseEvent<HTMLElement>) {
    if (zoom <= 1) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="relative flex h-full min-h-[20rem] items-stretch p-3 sm:p-4 lg:p-6">
      <div className="relative flex min-h-[18rem] flex-1 overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/60 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <AnimatedGridPattern
          width={48}
          height={48}
          numSquares={22}
          maxOpacity={0.16}
          className="[mask-image:radial-gradient(circle_at_center,black,transparent_80%)]"
        />
        <PointerSpotlight radius={220} intensity={0.1} />
        <ShineBorder borderRadius={22} duration={16} />
        <BorderBeam borderRadius={22} size={160} duration={14} />

        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3 text-left sm:p-5 lg:p-6">
          {item.src ? (
            <div className="relative h-full w-full">
              <Image
                src={item.src.src}
                alt={item.src.alt}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className={cn(
                  "object-contain",
                  !reduceMotion &&
                    "transition-transform duration-500 ease-(--ease-premium)",
                )}
                style={{
                  transform: "scale(1)",
                  transformOrigin: "center",
                }}
              />
            </div>
          ) : (
            <PlaceholderImage
              label={mediaTbdLabel}
              aspect="h-full min-h-[18rem]"
              className="w-full rounded-[1rem] border-border/60 bg-background/40"
            />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background via-background/55 to-transparent" />

          <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5 lg:left-6 lg:top-6">
            <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
              <CollapsibleTrigger
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.2em]",
                  FAST_GLASS_BUTTON,
                  FOCUS_RING_INSET,
                )}
              >
                <Info aria-hidden="true" className="size-3.5" />
                <span>{detailViewLabel}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-3 transition-transform duration-(--motion-fast) ease-(--ease-premium)",
                    infoOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="glass-surface w-[min(20rem,calc(100vw-4rem))] rounded-2xl p-3">
                  <div className="grid gap-3">
                    <p className="text-xs leading-5 text-foreground/85">
                      {detailHint}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <MetaPill>{item.type}</MetaPill>
                      <MetaPill>{item.collection}</MetaPill>
                      {item.location ? <MetaPill>{item.location}</MetaPill> : null}
                      {item.capturedAt ? (
                        <MetaPill>{item.capturedAt}</MetaPill>
                      ) : null}
                    </div>
                    {item.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <MetaPill key={tag}>{tag}</MetaPill>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            aria-label={viewDetailLabel}
            className={cn(
              "absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] sm:right-5 sm:top-5 lg:right-6 lg:top-6",
              FAST_GLASS_BUTTON,
              FOCUS_RING_INSET,
            )}
          >
            <Maximize2 aria-hidden="true" className="size-4" />
            <span>{viewDetailLabel}</span>
          </button>

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 lg:inset-x-6">
            <div className="glass-surface max-w-sm rounded-2xl px-3 py-2">
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                {item.src ? viewDetailLabel : mediaTbdLabel}
              </p>
              <p className="mt-1 text-xs leading-5 text-foreground/85">
                {item.src
                  ? detailHint
                  : placeholderHint}
              </p>
            </div>
          </div>
        </div>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent
            hideCloseButton
            className={cn(
              "left-0 top-0 z-70 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-background/98 p-0",
              "sm:left-1/2 sm:top-1/2 sm:h-[min(94vh,64rem)] sm:w-[calc(100vw-2rem)] sm:max-w-[94rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.6rem] sm:border",
            )}
          >
            <div className="relative flex h-full flex-col">
              <DialogHeader className="sr-only">
                <DialogTitle>{item.title}</DialogTitle>
                <DialogDescription>{detailHint}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
                <div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                    {detailViewLabel}
                  </p>
                  <p className="text-sm text-foreground">{item.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canZoom ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setZoom((value) => clampZoom(value - 0.5))}
                        disabled={zoom <= 1}
                        aria-label={zoomOutLabel}
                        className={cn(
                          "inline-flex size-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40",
                          FAST_GLASS_BUTTON,
                          FOCUS_RING_INSET,
                        )}
                      >
                        <Minus aria-hidden="true" className="size-4" />
                      </button>
                      <span className="min-w-12 text-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((value) => clampZoom(value + 0.5))}
                        disabled={zoom >= 3}
                        aria-label={zoomInLabel}
                        className={cn(
                          "inline-flex size-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40",
                          FAST_GLASS_BUTTON,
                          FOCUS_RING_INSET,
                        )}
                      >
                        <Plus aria-hidden="true" className="size-4" />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setDetailOpen(false)}
                    aria-label={closeDetailLabel}
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-full",
                      FAST_GLASS_BUTTON,
                      FOCUS_RING_INSET,
                    )}
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
                <div
                  className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_42%),linear-gradient(180deg,rgba(10,10,10,0.92),rgba(24,24,24,0.78))]"
                  onMouseMove={updateOrigin}
                  onMouseLeave={() => setOrigin("center")}
                >
                  <AnimatedGridPattern
                    width={52}
                    height={52}
                    numSquares={16}
                    maxOpacity={0.1}
                    className="[mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"
                  />
                  <PointerSpotlight radius={260} intensity={0.12} />
                  <ShineBorder borderRadius={20} duration={18} />

                  {item.src ? (
                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={item.src.src}
                        alt={item.src.alt}
                        fill
                        priority
                        sizes="100vw"
                        className={cn(
                          "object-contain",
                          !reduceMotion &&
                            "transition-transform duration-300 ease-(--ease-premium)",
                        )}
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: origin,
                        }}
                      />
                    </div>
                  ) : (
                    <PlaceholderImage
                      label={mediaTbdLabel}
                      aspect="h-full min-h-[16rem]"
                      className="w-full rounded-none border-0 bg-transparent"
                    />
                  )}
                </div>
                <ViewerWatermark collection={item.collection} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border/70 bg-background/55 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}

function ViewerWatermark({ collection }: { collection: string }) {
  const domain = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="mt-3 flex items-center justify-center">
      <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-border/70 bg-background/82 px-3 py-1.5 text-center font-mono text-[0.56rem] uppercase tracking-[0.22em] text-muted-foreground shadow-sm backdrop-blur-sm">
        <span>{domain}</span>
        <span className="hidden sm:inline">/</span>
        <span>{collection}</span>
      </div>
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
