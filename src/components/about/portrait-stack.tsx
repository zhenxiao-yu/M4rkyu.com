"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

export interface PortraitStackItem {
  src: string;
  alt: string;
  caption?: string;
  focal?: "top" | "center" | "bottom";
}

interface PortraitStackProps {
  title: string;
  eyebrow: string;
  placeholder: string;
  previousLabel: string;
  nextLabel: string;
  items: PortraitStackItem[];
}

export function PortraitStack({
  title,
  eyebrow,
  placeholder,
  previousLabel,
  nextLabel,
  items,
}: PortraitStackProps) {
  const [index, setIndex] = useState(0);
  const hasItems = items.length > 0;
  const current = hasItems ? items[index] : null;
  const count = Math.max(items.length, 1);
  const caption = current?.caption ?? title;

  function move(delta: number) {
    if (!hasItems) return;
    setIndex((value) => (value + delta + items.length) % items.length);
  }

  return (
    <Card className="h-full overflow-hidden bg-card/85">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="grid gap-1.5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 pt-0 sm:p-5 sm:pt-0">
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-border bg-background shadow-sm",
            FOCUS_RING_INSET,
          )}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") move(-1);
            if (event.key === "ArrowRight") move(1);
          }}
        >
          <div className="relative aspect-[4/5]">
            {current ? (
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(100vw - 4rem), 33vw"
                className={cn(
                  "object-cover transition-opacity duration-(--motion-medium) ease-(--ease-premium)",
                  current.focal === "top"
                    ? "object-top"
                    : current.focal === "bottom"
                      ? "object-bottom"
                      : "object-center",
                )}
                quality={90}
                priority={index === 0}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-cyber-grid">
                <div className="grid gap-3 text-center">
                  <Camera
                    className="mx-auto size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="px-8 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {placeholder}
                  </p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/82 to-transparent" />
            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate rounded-md bg-background/72 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
                {caption}
              </p>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={!hasItems || items.length < 2}
                  aria-label={previousLabel}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/72 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-45",
                    FOCUS_RING_INSET,
                  )}
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={!hasItems || items.length < 2}
                  aria-label={nextLabel}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/72 text-muted-foreground backdrop-blur transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-45",
                    FOCUS_RING_INSET,
                  )}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
