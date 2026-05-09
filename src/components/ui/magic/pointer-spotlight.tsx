"use client";

// Adapted from Aceternity / Magic UI · sprint-4 phase 4.1

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface PointerSpotlightProps {
  /** Radius of the spotlight circle in pixels. */
  radius?: number;
  /** 0–1 intensity multiplier on the highlight color. */
  intensity?: number;
  className?: string;
}

/**
 * Renders an absolutely-positioned overlay that paints a soft radial
 * gradient at the visitor's pointer position inside the *immediate*
 * positioned parent. The component must live inside an element with
 * `position: relative` (or absolute / fixed) for the overlay to fill
 * it correctly.
 *
 * Pointer position is written to two CSS custom properties via
 * `requestAnimationFrame` so we never re-render on `pointermove`.
 *
 * The overlay is always present in the DOM (so SSR and the first
 * client render produce identical markup — no hydration mismatch).
 * Visibility is gated by the `--spot-opacity` custom property, which
 * stays `0` on touch devices and when `prefers-reduced-motion: reduce`
 * is set, because the pointer listener is never attached in those
 * cases.
 */
export function PointerSpotlight({
  radius = 300,
  intensity = 0.12,
  className,
}: PointerSpotlightProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const clamped = Math.max(0, Math.min(1, intensity));

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const node = ref.current;
    if (!node) return;
    // Listen on the parent so the spotlight tracks pointer over the
    // whole hero, not just the empty overlay div on top.
    const target = node.parentElement;
    if (!target) return;

    const handle = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        node.style.setProperty("--spot-x", `${x}px`);
        node.style.setProperty("--spot-y", `${y}px`);
        node.style.setProperty("--spot-opacity", "1");
        rafRef.current = null;
      });
    };

    const leave = () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        node.style.setProperty("--spot-opacity", "0");
        rafRef.current = null;
      });
    };

    target.addEventListener("pointermove", handle);
    target.addEventListener("pointerleave", leave);
    return () => {
      target.removeEventListener("pointermove", handle);
      target.removeEventListener("pointerleave", leave);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-10 transition-opacity duration-(--motion-fast) ease-(--ease-premium)",
        className,
      )}
      style={{
        opacity: "var(--spot-opacity, 0)",
        background: `radial-gradient(circle ${radius}px at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in srgb, var(--ring) ${Math.round(clamped * 100)}%, transparent) 0%, transparent 70%)`,
      }}
    />
  );
}
