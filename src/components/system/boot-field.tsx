"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Canvas2D atmosphere for the boot overlay — a sparse field of rising
 * phosphor embers, tinted with the active theme's `--ring` ink. Additive
 * over dark surfaces (glow), plain over light (coral specks). Self-contained:
 * sizes to its parent, fades in, and tears down its rAF + listeners on
 * unmount. Skipped entirely under reduced motion.
 */
export function BootField() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ink =
      getComputedStyle(canvas).getPropertyValue("--ring").trim() || "#ff5a3c";
    const dark =
      document.documentElement.getAttribute("data-theme") === "dark";

    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    type Ember = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      tw: number;
    };
    const make = (): Ember => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-4, 4),
      vy: -rand(6, 26),
      r: rand(0.4, 1.7),
      a: rand(0.05, 0.42),
      tw: rand(0, Math.PI * 2),
    });
    const count = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
    const embers: Ember[] = Array.from({ length: count }, make);

    let last = performance.now();
    let intro = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      intro = Math.min(1, intro + dt * 1.5);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      ctx.fillStyle = ink;
      for (const p of embers) {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.tw += dt * 3;
        if (p.y < -8) {
          p.y = h + 8;
          p.x = rand(0, w);
        }
        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;
        ctx.globalAlpha = Math.max(
          0,
          p.a * intro * (0.55 + 0.45 * Math.sin(p.tw)),
        );
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <canvas
      ref={ref}
      className="boot-canvas pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
