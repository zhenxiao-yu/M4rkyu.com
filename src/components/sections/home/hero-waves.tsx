"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface HeroWavesProps {
  className?: string;
}

/**
 * Full-bleed canvas wave field for the hero background. 14 sine waves
 * drawn as horizontal strokes, each phase-shifted on time. Auto-paused
 * via IntersectionObserver. Reduced-motion: paints one static frame
 * and stops the ticker.
 *
 * Color: pulls `--ring` from a temporary span on mount so the wave
 * tone always matches the active theme without manual recoloring.
 */
export function HeroWaves({ className }: HeroWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let t0 = performance.now();
    let lastPaint = 0;
    const FRAME_BUDGET_MS = 1000 / 30; // ~30 fps cap, halves canvas CPU vs uncapped RAF

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    // Read the current `--ring` token's resolved RGB color. Captured
    // via a probe span so it stays in sync with whatever theme tokens
    // are active. Re-read whenever `data-theme` on <html> flips so
    // the canvas tone follows light/dark mode switches.
    function readStrokeColor() {
      const probe = document.createElement("span");
      probe.className = "text-ring";
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }

    resize();
    window.addEventListener("resize", resize);
    let base = readStrokeColor();
    const themeObserver = new MutationObserver(() => {
      base = readStrokeColor();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    function paint(now: number) {
      if (!running && !reduce) return;
      // 30fps cap — skip paint work if the previous frame is still
      // within budget. We still schedule the next RAF tick so the loop
      // continues; the gating is cheap.
      if (running && now - lastPaint < FRAME_BUDGET_MS) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;
      const t = (now - t0) / 1000;
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx!.clearRect(0, 0, w, h);

      const LINES = 14;
      for (let i = 0; i < LINES; i++) {
        const y0 = (h / (LINES - 1)) * i;
        const amp = 14 + i * 2;
        const freq = 0.004 + i * 0.0005;
        const phase = t * 0.6 + i * 0.45;
        const opacity = 0.06 + (i / LINES) * 0.16;
        ctx!.strokeStyle = base.startsWith("rgb")
          ? base.replace("rgb(", "rgba(").replace(")", `, ${opacity})`)
          : base;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const y = y0 + Math.sin(x * freq + phase) * amp;
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      }

      if (running) raf = requestAnimationFrame(paint);
    }

    if (reduce) {
      // Render one static frame and stop.
      paint(performance.now());
      return () => {
        window.removeEventListener("resize", resize);
        themeObserver.disconnect();
      };
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
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      running = false;
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 size-full", className)}
      aria-hidden="true"
    />
  );
}
