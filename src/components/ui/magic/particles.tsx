"use client";

// Adapted from Magic UI · sprint-4 phase 4.4

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ParticlesProps {
  /** Total particle count. Cap low — defaults to 32. */
  quantity?: number;
  /** Maximum particle radius in CSS pixels. Default: 1.4. */
  size?: number;
  /** Drift speed multiplier in pixels per frame. Default: 0.1. */
  speed?: number;
  /** Particle color. Default: var(--ring). */
  color?: string;
  /** 0–1 max alpha. Default: 0.55. */
  maxOpacity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}

/**
 * Sparse drifting dots — ambient atmosphere only. Draws to a single
 * canvas with `requestAnimationFrame`; no per-particle DOM nodes.
 * The container must be `position: relative` (or absolute / fixed)
 * so the canvas can fill it.
 *
 * Short-circuits to `null` on `prefers-reduced-motion: reduce`.
 */
export function Particles({
  quantity = 32,
  size = 1.4,
  speed = 0.1,
  color = "var(--ring)",
  maxOpacity = 0.55,
  className,
}: ParticlesProps) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Resolve the CSS color once via a hidden element so we can plug
    // it into ctx.fillStyle (canvas does not understand var(...)).
    const probe = document.createElement("span");
    probe.style.color = color;
    document.body.appendChild(probe);
    let resolvedColor: string;
    try {
      resolvedColor = getComputedStyle(probe).color;
    } finally {
      document.body.removeChild(probe);
    }

    function fitCanvas() {
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      // Reset the transform before scaling — canvas 2D transforms are
      // cumulative, and ResizeObserver can fire repeatedly.
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }
    }

    function seed() {
      if (!canvas) return;
      const { width, height } = canvas.getBoundingClientRect();
      particlesRef.current = Array.from({ length: quantity }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * size + 0.4,
        a: Math.random() * maxOpacity,
      }));
    }

    function tick() {
      if (!canvas || !ctx) return;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2) p.x = width + 2;
        if (p.x > width + 2) p.x = -2;
        if (p.y < -2) p.y = height + 2;
        if (p.y > height + 2) p.y = -2;
        ctx.beginPath();
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    }

    fitCanvas();
    seed();
    rafRef.current = requestAnimationFrame(tick);

    const observer = new ResizeObserver(() => {
      fitCanvas();
      seed();
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [reduceMotion, quantity, size, speed, color, maxOpacity]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
