"use client";

import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  children: ReactNode;
  /** Max rotation in degrees on each axis. Default 8. */
  maxTilt?: number;
  /** Glare overlay strength (0–1). Default 0.45. Set 0 to disable. */
  glare?: number;
  /** Optional scale on hover. Default 1.015. */
  hoverScale?: number;
  className?: string;
}

/**
 * Cursor-relative 3D tilt with a moving sheen overlay. Heavier than
 * `BentoTilt` (which we already ship) — TiltedCard adds:
 *
 *   - Higher default tilt range (8° vs 6°) — readable as a real tilt.
 *   - Specular glare layer that tracks the cursor across the surface.
 *   - Subtle hover-scale that pairs with the tilt for "lift".
 *
 * Used for the SelectedWork project tiles where we want the cards to
 * feel like physical objects under the cursor. Reduced-motion + coarse
 * pointers degrade to a static container (no tilt, no glare).
 */
export function TiltedCard({
  children,
  maxTilt = 8,
  glare = 0.45,
  hoverScale = 1.015,
  className,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, alpha: 0 });
  const reduce = useReducedMotion();

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    if (event.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const tiltX = (0.5 - py) * (maxTilt * 2);
    const tiltY = (px - 0.5) * (maxTilt * 2);
    setTransform(
      `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(
        2,
      )}deg) scale(${hoverScale})`,
    );
    setGlarePos({ x: px * 100, y: py * 100, alpha: glare });
  }

  function onPointerLeave() {
    setTransform("");
    setGlarePos((g) => ({ ...g, alpha: 0 }));
  }

  const inlineGlare: CSSProperties = {
    background: `radial-gradient(420px circle at ${glarePos.x}% ${glarePos.y}%, color-mix(in srgb, var(--ring) ${(glarePos.alpha * 80).toFixed(0)}%, transparent), transparent 55%)`,
    opacity: glarePos.alpha,
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transform,
        transformStyle: "preserve-3d",
        transition: "transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1)",
      }}
      className={cn("relative", className)}
    >
      {children}
      {glare > 0 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen transition-opacity duration-(--motion-fast)"
          style={inlineGlare}
        />
      ) : null}
    </div>
  );
}
