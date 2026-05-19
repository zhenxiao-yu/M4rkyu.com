"use client";

import {
  Children,
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

interface CarouselProps {
  /** One element per slide. */
  children: ReactNode;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  ariaLabel: string;
  controlLabels?: { prev: string; next: string };
  slideLabels?: string[];
  className?: string;
}

/**
 * Discrete-slide carousel. Renders one slide at a time via
 * AnimatePresence — simple, reliable, no scroll-position tracking.
 *
 * Pause conditions: reduced-motion, hover (when pauseOnHover), or
 * document hidden.
 */
export function Carousel({
  children,
  loop = true,
  autoplay = true,
  autoplayDelay = 6000,
  pauseOnHover = true,
  ariaLabel,
  controlLabels,
  slideLabels,
  className,
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [isHover, setHover] = useState(false);
  const [tabHidden, setTabHidden] = useState(() =>
    typeof document === "undefined" ? false : document.hidden,
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!autoplay || reduced || count < 2) return;
    if (pauseOnHover && isHover) return;
    if (tabHidden) return;
    const id = window.setInterval(() => {
      setIndex((i) => (loop ? (i + 1) % count : Math.min(i + 1, count - 1)));
    }, autoplayDelay);
    return () => window.clearInterval(id);
  }, [
    autoplay,
    reduced,
    count,
    pauseOnHover,
    isHover,
    tabHidden,
    loop,
    autoplayDelay,
  ]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => {
        const next = i + dir;
        if (loop) return (next + count) % count;
        return Math.max(0, Math.min(count - 1, next));
      });
    },
    [loop, count],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    },
    [go],
  );

  const prevLabel = controlLabels?.prev ?? "Previous slide";
  const nextLabel = controlLabels?.next ?? "Next slide";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={pauseOnHover ? () => setHover(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHover(false) : undefined}
      onKeyDown={onKeyDown}
      className={cn("relative", className)}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={reduced ? false : { opacity: 0, x: 10 }}
            animate={reduced ? undefined : { opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            role="group"
            aria-roledescription="slide"
            aria-label={slideLabels?.[index] ?? `${index + 1} of ${count}`}
          >
            {slides[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div
            className="flex gap-1.5"
            role="tablist"
            aria-label={`${ariaLabel} pagination`}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={
                  slideLabels?.[i]
                    ? `Go to ${slideLabels[i]}`
                    : `Go to slide ${i + 1}`
                }
                onClick={() => setIndex(i)}
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                  i === index
                    ? "bg-ring"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/60",
                  FOCUS_RING_INSET,
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={prevLabel}
              onClick={() => go(-1)}
              disabled={!loop && index === 0}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
                FOCUS_RING_INSET,
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={nextLabel}
              onClick={() => go(1)}
              disabled={!loop && index === count - 1}
              className={cn(
                "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent",
                FOCUS_RING_INSET,
              )}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
