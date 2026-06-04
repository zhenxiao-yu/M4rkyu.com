"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  /** Maximum pull, in px, at the card edge. Default 10. */
  strength?: number;
  className?: string;
}

/**
 * Pointer-magnetic wrapper: the child eases toward the cursor while it
 * hovers, then springs back on leave. A classic high-touch
 * micro-interaction for CTAs.
 *
 * Honors prefers-reduced-motion (renders a plain span) and only reacts
 * to mouse input — touch never drives the pull (filtered at the event
 * level, matching the bento spotlight convention).
 */
export function Magnetic({ children, strength = 10, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (reduced) {
    return <span className={cn("inline-flex", className)}>{children}</span>;
  }

  function onPointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const relX = (e.clientX - r.left) / r.width - 0.5;
    const relY = (e.clientY - r.top) / r.height - 0.5;
    x.set(relX * strength * 2);
    y.set(relY * strength * 2);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.span
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.span>
  );
}
