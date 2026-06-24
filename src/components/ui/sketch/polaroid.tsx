import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HandCaption } from "./hand-note";

interface PolaroidProps {
  /** Photo source. Omit for the honest "photo soon" placeholder. */
  src?: string;
  alt: string;
  /** Handwritten caption scrawled in the bottom frame. */
  caption?: ReactNode;
  /** Resting tilt in degrees — a taped print is never level. Default -2.5. */
  tilt?: number;
  /** Tailwind aspect for the photo window. Default 4/5 (a real print). */
  aspect?: string;
  /** Strip of tape across the top. Default true. */
  tape?: boolean;
  /** Shown in the empty window when there's no src yet. */
  placeholderLabel?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * A taped Polaroid — the warmest interruption in the cold grid. Cream
 * photo paper (fixed, so it reads as a physical print on either theme),
 * a slightly torn tape strip, a grayscale photo that colorizes on hover,
 * and a handwritten caption. Tilts at rest, straightens and lifts when
 * you point at it. Decorative warmth — never the only way to reach
 * content.
 */
export function Polaroid({
  src,
  alt,
  caption,
  tilt = -2.5,
  aspect = "aspect-[4/5]",
  tape = true,
  placeholderLabel = "photo soon",
  className,
  priority,
  sizes = "(min-width: 768px) 20rem, 60vw",
}: PolaroidProps) {
  return (
    <figure
      style={{ ["--tilt"]: `${tilt}deg` } as CSSProperties}
      className={cn(
        "group relative inline-block rotate-[var(--tilt)] bg-card p-2.5 pb-3 text-card-foreground shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55)]",
        "transition-[rotate,translate,box-shadow] duration-(--motion-medium) ease-(--ease-premium)",
        "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:rotate-0 group-hover:shadow-[0_28px_60px_-26px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {/* Tape strip — translucent, faintly torn, pinned over the top edge. */}
      {tape ? (
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 bg-[rgba(120,120,110,0.22)] [clip-path:polygon(4%_0,98%_6%,96%_94%,2%_100%)]"
        />
      ) : null}

      {/* Photo window — dark when empty; grayscale → color on hover. */}
      <div
        className={cn(
          "relative overflow-hidden bg-media-well",
          aspect,
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={src.endsWith(".svg")}
            className="object-cover [@media(pointer:fine)]:grayscale transition duration-500 ease-(--ease-premium) [@media(pointer:fine)]:group-hover:grayscale-0 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            {/* film-frame ticks so the empty window still feels photographic */}
            <span
              aria-hidden="true"
              className="absolute inset-2 border border-dashed border-white/15"
            />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-white/45">
              {placeholderLabel}
            </span>
          </div>
        )}
      </div>

      {/* Caption — handwritten in the bottom frame. */}
      {caption ? (
        <figcaption className="px-1 pt-2.5">
          <HandCaption className="text-muted-foreground">{caption}</HandCaption>
        </figcaption>
      ) : (
        <div aria-hidden="true" className="pt-2.5" />
      )}
    </figure>
  );
}
