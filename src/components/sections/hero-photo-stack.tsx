"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface HeroPhotoFrame {
  /** Asset path (gallery collection cover or gallery-item src). */
  src: string;
  /** Alt text — used by the active full-bleed image only. */
  alt: string;
  /** Slug used as stable React key. */
  slug: string;
}

interface HeroPhotoStackProps {
  /** Frames to cycle through. Component is a no-op (empty bg) if the
   *  list is empty — covers the no-content path gracefully. */
  frames: HeroPhotoFrame[];
}

// Active photo opacity. Audit pass: bumped from 0.32 to 0.55 so the
// placeholder geometric covers read as intentional graphic art instead
// of dim mud. Pair this with REMOVING the parent `bg-background/55`
// scrim in `hero-section.tsx` — they were fighting each other.
const FALLBACK_OPACITY = 0.55;

/**
 * Full-bleed photographic substrate that cycles through `frames` on
 * tap of the mini-preview tile. Port of the click-to-expand mechanic
 * from adrianhajdin/award-winning-website's `Hero.jsx` (videos there;
 * here we use real gallery covers — Mark's actual visual practice
 * instead of stock video).
 *
 * Layers:
 *   - `<Image>` at `inset-0`, dimmed (the "showcased" frame).
 *   - A mini-preview tile at `absolute-center` showing the NEXT frame.
 *     Click cycles `currentIndex` forward.
 *   - On click, the tile expands via a layout animation, the
 *     showcased frame swaps to the new index, the tile scales back to
 *     mini after the transition.
 *
 * Reduced-motion path: the tile still cycles frames but the expand
 * animation is replaced by a crossfade. No scale, no layout shift.
 *
 * Performance: `<Image>` with `priority` on the visible frame,
 * `loading="lazy"` on the preview. `sizes="100vw"` so Next emits
 * appropriate srcSet.
 */
export function HeroPhotoStack({ frames }: HeroPhotoStackProps) {
  const t = useTranslations("Home.hero");
  const reduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);

  // `frames` is a stable server-prop array — `length` resolves once.
  const total = frames.length;
  const nextIndex = useMemo(
    () => (total > 0 ? (currentIndex + 1) % total : 0),
    [currentIndex, total],
  );

  const currentFrame = total > 0 ? frames[currentIndex] : undefined;
  const nextFrame = total > 0 ? frames[nextIndex] : undefined;

  const onCycle = useCallback(() => {
    if (total === 0) return;
    if (reduceMotion) {
      // Reduced-motion: immediate swap, no expand animation.
      setCurrentIndex((i) => (i + 1) % total);
      return;
    }
    setIsExpanding(true);
    // Let the expand animation play for ~340ms, then swap the
    // showcased frame and reset the tile. AnimatePresence handles the
    // cross-fade on the underlying image.
    window.setTimeout(() => {
      setCurrentIndex((i) => (i + 1) % total);
      setIsExpanding(false);
    }, 340);
  }, [reduceMotion, total]);

  // Empty-content fallback — render nothing but a dimmed background so
  // the rest of the hero composes correctly.
  if (!currentFrame) return null;

  return (
    <>
      {/* Showcased full-bleed frame. AnimatePresence-driven crossfade
        * when `currentIndex` changes. `-z-10` so atmospheric layers
        * and content render above it. */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={currentFrame.slug}
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: FALLBACK_OPACITY }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Image
            src={currentFrame.src}
            alt={currentFrame.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Mini-preview tile — bottom-left corner of the hero. Audit
        * pass moved this from `absolute inset-0 grid place-items-center`
        * (which made it unreachable on mobile and ambiguous on desktop)
        * to a fixed corner anchor so it reads as a "now showing" badge
        * and never competes with the headline or brief card. `z-30` is
        * resolved in the SECTION's stacking context now that the
        * photo-stack wrapper has no z-index. */}
      {nextFrame ? (
        <motion.button
          type="button"
          data-boot="preview"
          onClick={onCycle}
          aria-label={t("previewAria")}
          className={cn(
            "group absolute bottom-4 left-4 z-30 aspect-square w-24 overflow-hidden rounded-2xl border border-border/70 bg-background/70 shadow-xl shadow-black/20 backdrop-blur-xl outline-none transition-[border-color,box-shadow] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:left-6 sm:w-28",
            isExpanding && "pointer-events-none",
          )}
          // Tap-feedback pulse only — the "expand to fill" mechanic
          // doesn't fit a corner-anchored tile (it'd grow off-axis).
          // Keep the cycle action and let the AnimatePresence
          // crossfade on the bg image carry the visual payoff.
          animate={
            reduceMotion ? { scale: 1 } : { scale: isExpanding ? 0.92 : 1 }
          }
          transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Image
            src={nextFrame.src}
            alt=""
            fill
            sizes="(min-width: 640px) 112px, 96px"
            className="object-cover transition-transform duration-(--motion-base) ease-(--ease-premium) group-hover:scale-105"
          />
          {/* Hint chip — fades in on hover. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 bg-linear-to-t from-background/85 via-background/50 to-transparent px-2 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground/80 opacity-0 transition-opacity duration-(--motion-fast) ease-(--ease-premium) group-hover:opacity-100"
          >
            <span className="truncate">{t("previewLabel")}</span>
            <ArrowUpRight aria-hidden="true" className="size-2.5 shrink-0" />
          </span>
        </motion.button>
      ) : null}
    </>
  );
}
