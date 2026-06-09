"use client";

import { useState } from "react";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { BlurImage } from "@/components/ui/blur-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import type { GalleryItem } from "@/content/schemas";
import { SITE_URL } from "@/lib/seo/site";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

export const FAST_GLASS_BUTTON = cn(
  "glass-surface glass-interactive text-muted-foreground hover:text-foreground",
  "transition-[transform,color,box-shadow,background-color,border-color] duration-(--motion-fast) ease-(--ease-premium)",
  "motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.96]",
);

export function FrameMedia({
  item,
  plateLabel,
  plateIndex,
  plateTotal,
  mediaTbdLabel,
  zoomInLabel,
  zoomOutLabel,
  viewDetailLabel,
  closeDetailLabel,
  placeholderHint,
}: {
  item: GalleryItem;
  plateLabel: string;
  plateIndex: string;
  plateTotal: string;
  mediaTbdLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  viewDetailLabel: string;
  closeDetailLabel: string;
  placeholderHint: string;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const [detailOpen, setDetailOpen] = useState(false);
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
      {/* Viewing surface — image is the focal point. Previously stacked
       * AnimatedGridPattern + ShineBorder + BorderBeam + spotlight all
       * competing behind every photo; that read as decoration noise.
       * Now: one calm glass plate with a quiet pointer spotlight, all
       * voice carried by the typographic plate mark below. */}
      <div className="relative flex min-h-[18rem] flex-1 overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/60 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <PointerSpotlight radius={260} intensity={0.06} />

        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3 text-left sm:p-5 lg:p-6">
          {item.src ? (
            <div className="relative h-full w-full">
              <BlurImage
                src={item.src.src}
                alt={item.src.alt}
                fill
                priority
                fadeOnly
                sizes="(min-width: 1024px) 900px, 100vw"
                placeholder={item.src.blurDataURL ? "blur" : undefined}
                blurDataURL={item.src.blurDataURL}
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

          {/* Plate mark — the conceptual anchor. Letterpress-style pixel
           * numerals quietly assert "this is a curated exhibition view,"
           * replacing the noisier info collapsible that used to live here.
           * Pixel font auto-swaps to the display stack on CJK contexts
           * via globals.css's :lang(zh) guard, so this stays legible. */}
          <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-baseline gap-2 sm:left-5 sm:top-5 lg:left-6 lg:top-6">
            <span className="font-pixel text-xl leading-none uppercase tracking-wide text-foreground/75">
              {plateLabel}
            </span>
            <span className="font-pixel text-xl leading-none text-foreground/75 tabular-nums">
              {plateIndex}
              <span className="mx-0.5 text-muted-foreground/50">/</span>
              {plateTotal}
            </span>
          </div>

          {/* Placeholder-only hint. When a real image is mounted, the wall
           * label in the sidebar carries the same intent — no need to
           * duplicate it as a floating bottom strip over the artwork. */}
          {!item.src ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-5 lg:inset-x-6">
              <div className="glass-surface max-w-sm rounded-2xl px-3 py-2">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {mediaTbdLabel}
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/85">
                  {placeholderHint}
                </p>
              </div>
            </div>
          ) : null}

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
                <DialogDescription>{item.caption}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
                <div className="flex items-baseline gap-2">
                  <span
                    aria-hidden="true"
                    className="font-pixel text-base leading-none uppercase tracking-wide text-foreground/65"
                  >
                    {plateLabel}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-pixel text-base leading-none text-foreground/65 tabular-nums"
                  >
                    {plateIndex}
                    <span className="mx-0.5 text-muted-foreground/50">/</span>
                    {plateTotal}
                  </span>
                  <span className="ml-2 truncate text-sm text-foreground">
                    {item.title}
                  </span>
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
                  className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_46%),linear-gradient(180deg,rgba(10,10,10,0.94),rgba(20,20,20,0.82))]"
                  onMouseMove={updateOrigin}
                  onMouseLeave={() => setOrigin("center")}
                >
                  <PointerSpotlight radius={320} intensity={0.08} />

                  {/* Plate mark also rides the zoom dialog so the curator
                   * framing stays consistent across both surfaces. */}
                  <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-baseline gap-2 sm:left-5 sm:top-5">
                    <span className="font-pixel text-xl leading-none uppercase tracking-wide text-foreground/70">
                      {plateLabel}
                    </span>
                    <span className="font-pixel text-xl leading-none text-foreground/70 tabular-nums">
                      {plateIndex}
                      <span className="mx-0.5 text-muted-foreground/50">/</span>
                      {plateTotal}
                    </span>
                  </div>

                  {item.src ? (
                    <div className="relative h-full w-full overflow-hidden">
                      <BlurImage
                        src={item.src.src}
                        alt={item.src.alt}
                        fill
                        priority
                        fadeOnly
                        sizes="100vw"
                        placeholder={item.src.blurDataURL ? "blur" : undefined}
                        blurDataURL={item.src.blurDataURL}
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
