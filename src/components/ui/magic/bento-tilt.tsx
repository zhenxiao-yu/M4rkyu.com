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

interface BentoTiltProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on either axis. Default 6 — gentler than
   *  Zentry's reference (10°) to stay inside the motion doctrine. */
  maxTilt?: number;
  /** Scale applied while hovered. Default 0.985 — a barely-there
   *  press-into-screen feel that pairs with the rotation. */
  hoverScale?: number;
  /** Opt-in cursor-tracked sheen — a soft accent highlight that follows
   *  the pointer, reading as light catching a glass surface. Off by
   *  default so existing call sites are untouched. */
  glare?: boolean;
}

/**
 * Cursor-relative perspective tilt for cards, ported from the
 * adrianhajdin/award-winning-website "BentoTilt" pattern but adjusted to
 * our motion doctrine (smaller tilt, fine-pointer-only).
 *
 * Behavior:
 *   - Tracks the cursor's offset from the card center, maps to
 *     `rotateX` / `rotateY`, applies `perspective + scale3d`.
 *   - Skipped entirely on coarse pointers (touch) via a runtime check —
 *     phones don't get a hover state, full stop.
 *   - Respects `prefers-reduced-motion`: returns a static container
 *     with the children rendered flat.
 *
 * Performance: a single inline `transform` string set on mousemove. No
 * react state on every frame; we hold the latest transform in a
 * `useState` slot updated coarsely. The browser composites the tilt on
 * the GPU.
 */
export function BentoTilt({
  children,
  className,
  maxTilt = 6,
  hoverScale = 0.985,
  glare = false,
}: BentoTiltProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>("");
  // Glare position as percentages of the card; null when not hovering.
  const [glarePos, setGlarePos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node) return;
      // Skip touch / coarse pointers — hover tilt should never fire on
      // tap, only on real cursors. `pointerType` is the standardised
      // way to distinguish touch from mouse/pen on a PointerEvent.
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = node.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const tiltX = (relativeY - 0.5) * maxTilt;
      const tiltY = (relativeX - 0.5) * -maxTilt;
      setTransform(
        `perspective(720px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`,
      );
      if (glare) setGlarePos({ x: relativeX * 100, y: relativeY * 100 });
    },
    [glare, hoverScale, maxTilt],
  );

  const onPointerLeave = useCallback(() => {
    setTransform("");
    setGlarePos(null);
  }, []);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const style: CSSProperties = {
    transform: transform || undefined,
    transition: "transform 240ms cubic-bezier(0.2, 0.7, 0.2, 1)",
    transformStyle: "preserve-3d",
    willChange: transform ? "transform" : undefined,
  };

  return (
    // `@media (pointer: fine)` would be nice here but Tailwind v4
    // doesn't have a stock variant for it; the JS guard above covers
    // the touch case at runtime.
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={style}
      className={cn(glare && "relative isolate", className)}
    >
      {children}
      {glare ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-(--ease-premium)"
          style={{
            opacity: glarePos ? 1 : 0,
            background: glarePos
              ? `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, color-mix(in srgb, var(--ring) 24%, transparent), transparent 48%)`
              : undefined,
            mixBlendMode: "plus-lighter",
          }}
        />
      ) : null}
    </div>
  );
}
