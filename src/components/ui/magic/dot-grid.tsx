"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface DotGridProps {
  /** Spacing between dots in px. Default 28. */
  spacing?: number;
  /** Base dot radius in px. Default 1.4. */
  baseDotSize?: number;
  /** Maximum dot radius near the cursor. Default 4.2. */
  hoverDotSize?: number;
  /** Pixel radius within which the cursor influences dots. Default 160. */
  influenceRadius?: number;
  /** Base opacity for dots far from cursor. Default 0.28. */
  baseOpacity?: number;
  /** Opacity near the cursor. Default 1. */
  hoverOpacity?: number;
  /** CSS variable name for dot color. Default `--ring`. */
  colorVar?: string;
  /** Optional extra classes for the canvas. */
  className?: string;
}

// Cursor-aware dot grid (2D canvas). Auto-pauses via IntersectionObserver; theme-aware (--ring). Reduced-motion + touch render static. Fills its `relative` parent.
export function DotGrid({
  spacing = 28,
  baseDotSize = 1.4,
  hoverDotSize = 4.2,
  influenceRadius = 160,
  baseOpacity = 0.28,
  hoverOpacity = 1,
  colorVar = "--ring",
  className,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let raf = 0;
    let running = false;
    let lastPaint = 0;
    const FRAME_BUDGET_MS = 1000 / 45; // 45fps cap — responsive but kind to CPU

    function readColor() {
      const probe = document.createElement("span");
      probe.style.color = `var(${colorVar})`;
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      // Convert "rgb(r, g, b)" → "r, g, b" for rgba() composition.
      const match = color.match(/rgba?\(([^)]+)\)/);
      return match ? match[1].split(",").slice(0, 3).join(",").trim() : "34, 211, 238";
    }

    let baseColor = readColor();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const themeObserver = new MutationObserver(() => {
      baseColor = readColor();
    });
    // Watch light/dark AND palette — `--ring` (or a custom `colorVar`)
    // changes on a palette swap, not just on a light/dark toggle.
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-palette"],
    });

    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
    }
    function onPointerLeave() {
      pointerX = -9999;
      pointerY = -9999;
    }

    function paint(now: number) {
      if (!running) return;
      if (now - lastPaint < FRAME_BUDGET_MS) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;
      ctx!.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const influenceSq = influenceRadius * influenceRadius;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * spacing;
          const y = r * spacing;
          const dx = x - pointerX;
          const dy = y - pointerY;
          const distSq = dx * dx + dy * dy;
          let factor = 0;
          if (distSq < influenceSq) {
            const dist = Math.sqrt(distSq);
            factor = 1 - dist / influenceRadius;
            factor *= factor;
          }
          const size = baseDotSize + (hoverDotSize - baseDotSize) * factor;
          const alpha = baseOpacity + (hoverOpacity - baseOpacity) * factor;
          ctx!.fillStyle = `rgba(${baseColor}, ${alpha.toFixed(3)})`;
          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      raf = requestAnimationFrame(paint);
    }

    if (reduce) {
      // Render once and bail.
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = `rgba(${baseColor}, ${baseOpacity})`;
          ctx.beginPath();
          ctx.arc(c * spacing, r * spacing, baseDotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return () => {
        window.removeEventListener("resize", resize);
        themeObserver.disconnect();
      };
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(paint);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      running = false;
    };
  }, [
    spacing,
    baseDotSize,
    hoverDotSize,
    influenceRadius,
    baseOpacity,
    hoverOpacity,
    colorVar,
    reduce,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 size-full", className)}
    />
  );
}
