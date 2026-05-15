"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface MagnetProps {
  children: ReactNode;
  /** Maximum pixel pull at the cursor's tightest approach. Default 12. */
  strength?: number;
  /** Radius in px where pull starts. Default 80. */
  radius?: number;
  className?: string;
}

/**
 * Magnetic cursor pull. Children translate toward the pointer when it
 * enters `radius`. Falls back to a static no-op on touch pointers and
 * reduced-motion.
 *
 * Port of the ReactBits `Magnet` mechanic, tokenized for M4rkyu's motion
 * envelope (strength capped low; we don't want the CTA to lunge).
 */
export function Magnet({
  children,
  strength = 12,
  radius = 80,
  className,
}: MagnetProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    function onMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        setOffset({ x: 0, y: 0 });
        return;
      }
      const pull = 1 - dist / radius;
      setOffset({ x: dx * pull * (strength / radius) * radius, y: dy * pull * (strength / radius) * radius });
    }

    function onLeave() {
      setOffset({ x: 0, y: 0 });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, radius, reduce]);

  return (
    <span
      ref={ref}
      className={cn("inline-block transition-transform duration-(--motion-fast) ease-(--ease-premium)", className)}
      style={{ transform: `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)` }}
    >
      {children}
    </span>
  );
}
