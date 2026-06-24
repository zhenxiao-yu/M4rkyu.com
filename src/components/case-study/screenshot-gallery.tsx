"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { BlurImage } from "@/components/ui/blur-image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn, FOCUS_RING } from "@/lib/utils";

export interface GalleryShot {
  src: string;
  alt: string;
  label?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ScreenshotGalleryProps {
  shots: GalleryShot[];
  labels: { viewLarger: string; close: string; previous: string; next: string };
}

/**
 * Labeled screenshot gallery for /work/[slug]. Each shot sits in a CRT-style
 * frame (scanline overlay, grayscale→color + lift on fine-pointer hover) and
 * opens a lightbox with its label + caption and keyboard prev/next. Echoes the
 * /games GameCartridge screen motif. Reduced-motion + touch safe.
 */
export function ScreenshotGallery({ shots, labels }: ScreenshotGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const count = shots.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (count === 0) return null;
  const active = shots[index];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {shots.map((shot, i) => (
          <li key={`${i}-${shot.src}`}>
            <figure>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setOpen(true);
                }}
                className={cn(
                  "group relative block w-full overflow-hidden rounded-md border border-border bg-muted",
                  FOCUS_RING,
                )}
                aria-label={`${labels.viewLarger}${shot.label ? ` — ${shot.label}` : ""}`}
              >
                <span className="relative block aspect-16/10">
                  <BlurImage
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(min-width: 768px) 540px, 100vw"
                    unoptimized={shot.src.endsWith(".svg")}
                    className={cn(
                      "object-cover",
                      // Desaturate at rest → color on hover, fine pointers only.
                      "motion-safe:[@media(pointer:fine)]:grayscale motion-safe:[@media(pointer:fine)]:transition-[filter,transform] motion-safe:[@media(pointer:fine)]:duration-(--motion-medium) motion-safe:[@media(pointer:fine)]:ease-(--ease-premium) motion-safe:[@media(pointer:fine)]:group-hover:grayscale-0",
                    )}
                  />
                </span>
                {/* CRT scanline texture */}
                <span
                  aria-hidden="true"
                  className="scanline-layer pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
                />
                {/* "VIEW" prompt slides in on hover (fine pointers) */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-sm bg-background/80 px-2 py-1 font-pixel text-xs uppercase tracking-wider text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-(--motion-fast) ease-(--ease-premium) [@media(pointer:fine)]:group-hover:opacity-100"
                >
                  <Maximize2 className="size-3" /> {labels.viewLarger}
                </span>
              </button>
              {shot.label || shot.caption ? (
                <figcaption className="mt-2.5 flex items-baseline gap-2">
                  {shot.label ? (
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground">
                      {shot.label}
                    </span>
                  ) : null}
                  {shot.caption ? (
                    <span className="text-sm leading-6 text-muted-foreground">
                      {shot.caption}
                    </span>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideCloseButton
          className="max-w-4xl gap-3 bg-background/95 p-4 sm:p-6"
        >
          <DialogTitle className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            {active.label || `${index + 1} / ${count}`}
          </DialogTitle>

          <div className="relative aspect-16/10 w-full overflow-hidden rounded-md border border-border bg-muted">
            <BlurImage
              src={active.src}
              alt={active.alt}
              fill
              fadeOnly
              sizes="(min-width: 1024px) 880px, 100vw"
              unoptimized={active.src.endsWith(".svg")}
              className="object-contain"
            />
          </div>

          {active.caption ? (
            <DialogDescription className="leading-6">
              {active.caption}
            </DialogDescription>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
              {index + 1} / {count}
            </span>
            <div className="flex items-center gap-2">
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={labels.previous}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 pointer-coarse:size-11",
                      FOCUS_RING,
                    )}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={labels.next}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 pointer-coarse:size-11",
                      FOCUS_RING,
                    )}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
                  FOCUS_RING,
                )}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
