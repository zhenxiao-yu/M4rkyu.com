"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Pure-CSS 3D isometric "battlestation" — a stylised desk + monitor +
 * keyboard + mug built from layered 3D boxes. No three.js: every face is
 * a token-styled div positioned with CSS 3D transforms inside a single
 * `preserve-3d` rig.
 *
 * Motion: a slow yaw/pitch drift (motion-safe only) keeps it alive; on
 * fine pointers the rig also parallaxes toward the cursor. Reduced-motion
 * and coarse pointers fall back to the static inline base pose — still 3D,
 * just still.
 */

const BASE_POSE = "rotateX(-24deg) rotateY(-30deg)";

interface BoxProps {
  w: number;
  h: number;
  d: number;
  x?: number;
  y?: number;
  z?: number;
  radius?: number;
  topStyle?: CSSProperties;
  frontStyle?: CSSProperties;
  front?: ReactNode;
}

// A 3D box from four visible faces (top + front + two sides). Hidden back
// and bottom are skipped — the rig never yaws far enough to expose them.
function Box({
  w,
  h,
  d,
  x = 0,
  y = 0,
  z = 0,
  radius = 2,
  topStyle,
  frontStyle,
  front,
}: BoxProps) {
  const face: CSSProperties = {
    position: "absolute",
    border: "1px solid var(--glass-border)",
    borderRadius: radius,
    backfaceVisibility: "hidden",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px)`,
      }}
    >
      {/* top */}
      <div
        style={{
          ...face,
          width: w,
          height: d,
          left: 0,
          top: (h - d) / 2,
          background: "var(--ws-top)",
          transform: `rotateX(90deg) translateZ(${h / 2}px)`,
          ...topStyle,
        }}
      />
      {/* front */}
      <div
        style={{
          ...face,
          width: w,
          height: h,
          left: 0,
          top: 0,
          background: "var(--ws-side-l)",
          transform: `translateZ(${d / 2}px)`,
          ...frontStyle,
        }}
      >
        {front}
      </div>
      {/* right */}
      <div
        style={{
          ...face,
          width: d,
          height: h,
          left: (w - d) / 2,
          top: 0,
          background: "var(--ws-side-r)",
          transform: `rotateY(90deg) translateZ(${w / 2}px)`,
        }}
      />
      {/* left */}
      <div
        style={{
          ...face,
          width: d,
          height: h,
          left: (w - d) / 2,
          top: 0,
          background: "var(--ws-side-r)",
          transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
        }}
      />
    </div>
  );
}

export function WorkspaceScene({ className }: { className?: string }) {
  const rigRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState("");
  const reduce = useReducedMotion();

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const el = rigRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setParallax(
      `rotateY(${(px * 12).toFixed(2)}deg) rotateX(${(-py * 8).toFixed(2)}deg)`,
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Reserves a square layout box; the fixed 3D stage inside is
        // scaled to match so it fits cleanly inside the display panel.
        "relative isolate mx-auto aspect-square w-full max-w-72 select-none",
        className,
      )}
    >
      {/* 3D stage — fixed 320px design size, centered, scaled per breakpoint. */}
      <div
        ref={rigRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setParallax("")}
        className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 scale-90"
        style={
          {
            perspective: "1100px",
            perspectiveOrigin: "50% 42%",
            transformStyle: "preserve-3d",
            // Fake directional lighting — top brightest, sides progressively darker.
            ["--ws-top" as string]: "color-mix(in srgb, var(--foreground) 9%, transparent)",
            ["--ws-side-l" as string]: "color-mix(in srgb, var(--foreground) 15%, transparent)",
            ["--ws-side-r" as string]: "color-mix(in srgb, var(--foreground) 22%, transparent)",
          } as CSSProperties
        }
      >
      {/* parallax sub-rig (pointer) */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: parallax,
          transition: "transform 320ms cubic-bezier(0.2,0.7,0.2,1)",
        }}
      >
        {/* drift turntable (CSS, motion-safe). Inline transform = static fallback pose. */}
        <div
          className="absolute left-1/2 top-1/2 motion-safe:animate-[workspace-drift_11s_ease-in-out_infinite]"
          style={{
            transformStyle: "preserve-3d",
            transform: BASE_POSE,
          }}
        >
          {/* floor grid + glow */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 360,
              height: 360,
              marginLeft: -180,
              marginTop: -180,
              transform: "rotateX(90deg) translateZ(80px)",
              backgroundImage:
                "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ring) 30%, transparent), transparent 58%), linear-gradient(to right, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1px)",
              backgroundSize: "100% 100%, 24px 24px, 24px 24px",
              maskImage:
                "radial-gradient(circle at 50% 50%, black 38%, transparent 72%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 50%, black 38%, transparent 72%)",
            }}
          />

          {/* desk slab */}
          <Box w={210} h={14} d={130} y={0} radius={4} />
          {/* desk legs */}
          <Box w={12} h={72} d={12} x={88} y={43} z={50} />
          <Box w={12} h={72} d={12} x={-88} y={43} z={50} />
          <Box w={12} h={72} d={12} x={88} y={43} z={-50} />
          <Box w={12} h={72} d={12} x={-88} y={43} z={-50} />

          {/* monitor stand */}
          <Box w={14} h={26} d={12} y={-20} z={-30} />
          {/* monitor screen */}
          <Box
            w={120}
            h={70}
            d={10}
            y={-69}
            z={-34}
            radius={4}
            frontStyle={{
              border: "1px solid color-mix(in srgb, var(--ring) 45%, transparent)",
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--ring) 60%, transparent), color-mix(in srgb, var(--ring) 14%, transparent))",
              boxShadow:
                "0 0 36px -6px color-mix(in srgb, var(--ring) 70%, transparent)",
            }}
            front={
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent 0 3px, color-mix(in srgb, var(--background) 26%, transparent) 3px 4px)",
                }}
              >
                <span
                  className="motion-safe:animate-[workspace-caret_1.1s_steps(1)_infinite]"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 14,
                    width: 28,
                    height: 8,
                    borderRadius: 1,
                    background: "color-mix(in srgb, var(--background) 78%, transparent)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 28,
                    width: 52,
                    height: 6,
                    borderRadius: 1,
                    background: "color-mix(in srgb, var(--background) 50%, transparent)",
                  }}
                />
              </div>
            }
          />

          {/* keyboard */}
          <Box
            w={96}
            h={8}
            d={38}
            y={-11}
            z={28}
            radius={3}
            topStyle={{
              backgroundImage:
                "repeating-linear-gradient(to right, color-mix(in srgb, var(--foreground) 22%, transparent) 0 1px, transparent 1px 9px), repeating-linear-gradient(to bottom, color-mix(in srgb, var(--foreground) 22%, transparent) 0 1px, transparent 1px 8px)",
            }}
          />

          {/* mug */}
          <Box w={16} h={22} d={16} x={74} y={-18} z={18} radius={6} />
        </div>
      </div>
      </div>
    </div>
  );
}
