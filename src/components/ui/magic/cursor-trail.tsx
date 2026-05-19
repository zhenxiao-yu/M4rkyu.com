"use client";

import { useEffect, useRef } from "react";

interface CursorTrailProps {
  /** Number of trailing dots. Default 5. */
  count?: number;
  /** Dot diameter in px. Default 8. */
  size?: number;
  /** Easing factor per dot (lower = laggier). Default 0.32. */
  ease?: number;
  /** CSS variable for color. Default `--ring`. */
  colorVar?: string;
}

// Magnetic-afterimage cursor trail — pointer:fine + motion-safe only. Theme-aware via --ring; pure transforms, no per-frame layout.
export function CursorTrail({
  count = 5,
  size = 8,
  ease = 0.32,
  colorVar = "--ring",
}: CursorTrailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    const dots = Array.from(
      container.querySelectorAll<HTMLDivElement>("[data-trail-dot]"),
    );
    if (dots.length === 0) return;

    // Each dot has its own lerping position trailing the previous one.
    const positions = dots.map(() => ({ x: -100, y: -100 }));
    const target = { x: -100, y: -100 };
    let active = false;
    let raf = 0;
    let alive = true;

    function onMove(event: PointerEvent) {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!active) {
        active = true;
        // First move: snap every dot to the cursor so the trail doesn't
        // sweep in from off-screen on first appearance.
        for (const pos of positions) {
          pos.x = target.x;
          pos.y = target.y;
        }
      }
    }

    function onLeave() {
      target.x = -100;
      target.y = -100;
      active = false;
    }

    // Park the trail off-screen on resize so the dots don't sit at
    // stale coordinates after device rotation / viewport change.
    function onResize() {
      target.x = -100;
      target.y = -100;
      active = false;
      for (const pos of positions) {
        pos.x = -100;
        pos.y = -100;
      }
    }

    const containerEl = container;

    function tick() {
      // Guard against the cleanup running between two RAF frames during
      // a client-side navigation — the container may already be detached.
      if (!alive || !containerEl.isConnected) return;
      let prevX = target.x;
      let prevY = target.y;
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        pos.x += (prevX - pos.x) * ease;
        pos.y += (prevY - pos.y) * ease;
        const dot = dots[i];
        dot.style.transform = `translate3d(${pos.x - size / 2}px, ${pos.y - size / 2}px, 0)`;
        prevX = pos.x;
        prevY = pos.y;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    document.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [ease, size]);

  // Opacity ramp from leading dot to trailing: 0.55 → 0.10.
  const opacityFor = (i: number) =>
    Math.max(0.08, 0.55 - i * (0.45 / Math.max(count - 1, 1)));

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-trail-dot
          style={{
            width: size,
            height: size,
            opacity: opacityFor(i),
            backgroundColor: `var(${colorVar})`,
            transform: "translate3d(-100px, -100px, 0)",
            willChange: "transform",
          }}
          className="absolute left-0 top-0 rounded-full mix-blend-difference"
        />
      ))}
    </div>
  );
}
