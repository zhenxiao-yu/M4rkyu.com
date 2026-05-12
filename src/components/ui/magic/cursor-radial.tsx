"use client";

import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface CursorRadialProps {
  children: ReactNode;
  className?: string;
  /** Radial gradient inner color. Default: ring-cyan at 35% opacity. */
  color?: string;
  /** Radius of the gradient in px. Default 120. */
  radius?: number;
}

/**
 * Wraps its children with a cursor-following radial-gradient highlight
 * overlay. Adapted from adrianhajdin/award-winning-website's
 * `BentoCard` hover-button effect — there it tracks a "coming soon"
 * pill; here we use it as a hover atmosphere over the entire mission
 * brief card.
 *
 *   - Highlight opacity ramps 0 → 1 on mouseenter, back to 0 on leave.
 *   - Cursor position recorded relative to the wrapper, applied via a
 *     CSS variable so the radial gradient repaints without recomposing
 *     the layout.
 *   - Touch / coarse pointers receive no effect (no hover state).
 *   - Reduced-motion returns plain children — no overlay, no listeners.
 */
export function CursorRadial({
  children,
  className,
  color = "color-mix(in srgb, var(--ring) 28%, transparent)",
  radius = 120,
}: CursorRadialProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [{ x, y }, setPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [active, setActive] = useState(false);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    },
    [],
  );

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      setActive(true);
    },
    [],
  );

  const onPointerLeave = useCallback(() => {
    setActive(false);
  }, []);

  if (reduceMotion) {
    return <div className={cn("relative", className)}>{children}</div>;
  }

  const overlayStyle: CSSProperties = {
    background: `radial-gradient(${radius}px circle at ${x}px ${y}px, ${color}, transparent 70%)`,
    opacity: active ? 1 : 0,
    transition: "opacity 240ms cubic-bezier(0.2, 0.7, 0.2, 1)",
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={cn("relative", className)}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 mix-blend-screen dark:mix-blend-plus-lighter"
        style={overlayStyle}
      />
    </div>
  );
}
