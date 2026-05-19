"use client";

// Adapted from reactbits.dev/animations/magnet-lines (MIT).
// Lines orient toward the cursor like a magnetic field. Inactive
// off-screen (IntersectionObserver), inert on touch / reduced motion.

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MagnetLinesProps {
  rows?: number;
  columns?: number;
  containerSize?: string;
  lineColor?: string;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
  style?: CSSProperties;
}

export function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = "180px",
  lineColor = "currentColor",
  lineWidth = "1px",
  lineHeight = "14px",
  baseAngle = -10,
  className,
  style,
}: MagnetLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const container = containerRef.current;
    if (!container) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const items = container.querySelectorAll<HTMLSpanElement>(
      "span[data-magnet-line]",
    );
    let attached = false;
    let pending = false;
    let last: PointerEvent | null = null;

    function update() {
      pending = false;
      if (!last) return;
      const { clientX, clientY } = last;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle =
          Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
        item.style.setProperty("--rotate", `${angle}deg`);
      });
    }

    function onMove(event: PointerEvent) {
      last = event;
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(update);
    }

    function attach() {
      if (attached) return;
      window.addEventListener("pointermove", onMove, { passive: true });
      attached = true;
    }

    function detach() {
      if (!attached) return;
      window.removeEventListener("pointermove", onMove);
      attached = false;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) attach();
        else detach();
      },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      io.disconnect();
      detach();
    };
  }, [reduce]);

  const total = rows * columns;
  const cells = useMemo(() => Array.from({ length: total }), [total]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("grid place-items-center", className)}
      style={{
        width: containerSize,
        height: containerSize,
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        ...style,
      }}
    >
      {cells.map((_, i) => (
        <span
          key={i}
          data-magnet-line
          className="block transition-transform duration-(--motion-fast) ease-(--ease-premium)"
          style={{
            width: lineWidth,
            height: lineHeight,
            backgroundColor: lineColor,
            transform: "rotate(var(--rotate))",
            willChange: "transform",
            ["--rotate" as string]: `${baseAngle}deg`,
          }}
        />
      ))}
    </div>
  );
}
