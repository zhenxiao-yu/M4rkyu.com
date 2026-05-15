"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  born: number;
}

/**
 * Global click-spark emitter. Listens for clicks on the document and
 * paints a short burst of radial sparks centered on the click point.
 * Pure 2D canvas, fixed-position full-viewport, pointer-events: none.
 *
 * Reduced-motion: returns null entirely. Touch: still works (any
 * click fires) but at a smaller spark count so taps stay subtle.
 *
 * Color follows `--ring` (read via probe) so sparks pick up the
 * active theme.
 */
export function ClickSpark() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function readColor() {
      const probe = document.createElement("span");
      probe.style.color = "var(--ring)";
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      const match = color.match(/rgba?\(([^)]+)\)/);
      return match ? match[1].split(",").slice(0, 3).join(",").trim() : "34, 211, 238";
    }
    let baseColor = readColor();

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const themeObserver = new MutationObserver(() => {
      baseColor = readColor();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    function onClick(event: MouseEvent) {
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const count = touch ? 8 : 14;
      const speed = 220;
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const v = speed * (0.6 + Math.random() * 0.5);
        sparksRef.current.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 600 + Math.random() * 200,
          born: now,
        });
      }
    }

    let raf = 0;
    let prev = performance.now();
    function loop(now: number) {
      const dt = (now - prev) / 1000;
      prev = now;
      ctx!.clearRect(0, 0, width, height);

      const alive: Spark[] = [];
      for (const s of sparksRef.current) {
        const age = now - s.born;
        if (age > s.life) continue;
        const t = age / s.life;
        // Drag + gravity for a tactile feel.
        s.vx *= 0.94;
        s.vy = s.vy * 0.94 + 90 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const alpha = 1 - t;
        ctx!.fillStyle = `rgba(${baseColor}, ${(alpha * 0.9).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, 2 * (1 - t * 0.6), 0, Math.PI * 2);
        ctx!.fill();
        alive.push(s);
      }
      sparksRef.current = alive;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      themeObserver.disconnect();
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-70 size-full"
    />
  );
}
