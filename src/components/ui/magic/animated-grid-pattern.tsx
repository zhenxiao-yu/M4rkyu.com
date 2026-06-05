"use client";

// Adapted from Magic UI · AnimatedGridPattern · sprint-2 phase 2.1

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string | number;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

interface Square {
  id: number;
  pos: [number, number];
}

/**
 * Animated SVG grid that gently fades random cells in and out. Designed
 * to be the homepage hero ambient layer (replaces `bg-cyber-grid` on
 * that one section). The static rest state still reads as a hairline
 * grid so motion-reduced visitors don't lose the texture.
 *
 * Performance notes:
 * - `numSquares` defaults to 30 per docs/UI_LIBRARY_STRATEGY.md §11.
 * - All animation is on opacity only (cheap on the GPU).
 * - `useReducedMotion()` short-circuits to a static grid.
 */
export function AnimatedGridPattern({
  width = 56,
  height = 56,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 30,
  className,
  maxOpacity = 0.3,
  duration = 4,
  repeatDelay = 0.5,
}: AnimatedGridPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const reduceMotion = useReducedMotion();
  const [squares, setSquares] = useState<Square[]>([]);
  // Pause the per-cell tweens (and their onAnimationComplete state churn)
  // whenever the grid is scrolled off screen — on the snap-scroll home
  // every section is mounted at once, so an ungated grid animates ~30
  // cells forever for a layer no one is looking at.
  const [inView, setInView] = useState(true);
  const animate = !reduceMotion && inView;

  function generateSquares(count: number, w: number, h: number): Square[] {
    if (w === 0 || h === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: [
        Math.floor((Math.random() * w) / width),
        Math.floor((Math.random() * h) / height),
      ],
    }));
  }

  // Single effect: resize observer regenerates squares whenever the
  // container dimensions actually change (event-driven, not a chained
  // setState in render).
  useEffect(() => {
    if (!containerRef.current) return;
    const node = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w === dimensionsRef.current.width && h === dimensionsRef.current.height) {
          continue;
        }
        dimensionsRef.current = { width: w, height: h };
        setSquares(generateSquares(numSquares, w, h));
      }
    });
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numSquares, width, height]);

  // Toggle animation on/off as the grid enters / leaves the viewport.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? true),
      // No rootMargin: in the full-page snap home the Ask section's grid
      // would otherwise keep its per-cell state churn running while the
      // user is several slides away. Pause it the moment it's offscreen.
      { threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-current text-foreground/9 stroke-current",
        className,
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [px, py], id: squareId }, index) => {
          if (!animate) {
            return (
              <rect
                key={`${squareId}-${index}`}
                width={width - 1}
                height={height - 1}
                x={px * width + 1}
                y={py * height + 1}
                fill="currentColor"
                fillOpacity={maxOpacity * 0.6}
                strokeWidth="0"
              />
            );
          }
          return (
            <motion.rect
              key={`${squareId}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: maxOpacity }}
              // Cubic-bezier mirrors --ease-premium; motion's transition.ease cannot read CSS variables.
              transition={{
                duration,
                repeat: Infinity,
                delay: (index * 0.1) % duration,
                repeatType: "reverse",
                repeatDelay,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              onAnimationComplete={() => {
                setSquares((current) => {
                  if (!current[index]) return current;
                  const { width: w, height: h } = dimensionsRef.current;
                  if (w === 0 || h === 0) return current;
                  const next = [...current];
                  next[index] = {
                    id: current[index].id + 1,
                    pos: [
                      Math.floor((Math.random() * w) / width),
                      Math.floor((Math.random() * h) / height),
                    ],
                  };
                  return next;
                });
              }}
              width={width - 1}
              height={height - 1}
              x={px * width + 1}
              y={py * height + 1}
              fill="currentColor"
              strokeWidth="0"
            />
          );
        })}
      </svg>
    </svg>
  );
}
