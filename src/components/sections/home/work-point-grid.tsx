"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface WorkPointGridProps {
  /** Scroll progress 0→1; drives the wave strength. Update from parent. */
  progressRef: React.MutableRefObject<number>;
  className?: string;
}

/**
 * Cheap canvas-rendered point grid used as the SelectedWork background.
 * 60 points across the viewport, drawn each animation frame, with a
 * scroll-driven wave distortion radiating outward from center.
 *
 * Performance notes:
 *   - 60 points, not wodniack's 120 — half-budget per the plan.
 *   - Uses `requestAnimationFrame` ticker, not GSAP — the canvas is
 *     decorative, not on the critical scroll path. Reduced-motion or
 *     off-screen → ticker stops.
 *   - Auto-pauses via IntersectionObserver when the section is out
 *     of view.
 */
export function WorkPointGrid({ progressRef, className }: WorkPointGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let t0 = performance.now();
    let lastPaint = 0;
    const FRAME_BUDGET_MS = 1000 / 30; // ~30 fps cap for the decorative grid

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const COLS = 12;
    const ROWS = 8;

    function paint(now: number) {
      if (!running) return;
      if (now - lastPaint < FRAME_BUDGET_MS) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;
      const t = (now - t0) / 1000;
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx!.clearRect(0, 0, w, h);

      const gapX = w / (COLS + 1);
      const gapY = h / (ROWS + 1);
      const cx = w / 2;
      const cy = h / 2;
      const prog = progressRef.current;
      const strength = 6 + prog * 14;

      ctx!.strokeStyle = `rgba(34, 211, 238, ${0.06 + prog * 0.08})`;
      ctx!.lineWidth = 1;

      // Pass 1: stroke faint lines between adjacent points.
      ctx!.beginPath();
      for (let r = 1; r <= ROWS; r++) {
        for (let c = 1; c <= COLS; c++) {
          const x = c * gapX;
          const y = r * gapY;
          const dist = Math.hypot(x - cx, y - cy);
          const wave = Math.sin(dist / 60 - t * 1.4) * strength;
          const px = x;
          const py = y + wave;
          if (c < COLS) {
            const x2 = (c + 1) * gapX;
            const dist2 = Math.hypot(x2 - cx, y - cy);
            const wave2 = Math.sin(dist2 / 60 - t * 1.4) * strength;
            ctx!.moveTo(px, py);
            ctx!.lineTo(x2, y + wave2);
          }
          if (r < ROWS) {
            const y2 = (r + 1) * gapY;
            const dist2 = Math.hypot(x - cx, y2 - cy);
            const wave2 = Math.sin(dist2 / 60 - t * 1.4) * strength;
            ctx!.moveTo(px, py);
            ctx!.lineTo(x, y2 + wave2);
          }
        }
      }
      ctx!.stroke();

      // Pass 2: dots at each point, slightly brighter.
      ctx!.fillStyle = `rgba(34, 211, 238, ${0.4 + prog * 0.25})`;
      for (let r = 1; r <= ROWS; r++) {
        for (let c = 1; c <= COLS; c++) {
          const x = c * gapX;
          const y = r * gapY;
          const dist = Math.hypot(x - cx, y - cy);
          const wave = Math.sin(dist / 60 - t * 1.4) * strength;
          ctx!.fillRect(x - 1, y + wave - 1, 2, 2);
        }
      }

      raf = requestAnimationFrame(paint);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          t0 = performance.now();
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
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      running = false;
    };
  }, [progressRef, reduce]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
