import type { CSSProperties, ReactNode } from "react";
import { AnimatedGridPattern } from "@/components/ui/magic/animated-grid-pattern";
import { Particles } from "@/components/ui/magic/particles";
import { cn } from "@/lib/utils";

/**
 * Full-bleed atmospheric backdrop for a home-spine stage. One bold,
 * theme-aware identity per section so each screen reads as a designed
 * stage rather than a band on the global page background.
 *
 * Doctrine fit (M4RKYU.SYS — premium cyber-pixel command center):
 *   - Single accent only (`--ring`; `--game-accent` for the arcade slide,
 *     with a `--ring` fallback when that token isn't in scope).
 *   - Every motif is built from token-driven `color-mix` so it tracks the
 *     light/dark theme without JS.
 *   - Each variant fades toward the centre (vignette / soft mask) so the
 *     content sitting on top stays legible.
 *   - "Mix" performance budget: two variants carry a signature animated
 *     layer (`terminal` → AnimatedGridPattern, `blueprint` → Particles);
 *     the scanline drift is CSS-only and motion-safe; everything else is
 *     static gradients. Reduced motion degrades to the static rest state.
 *
 * Layers are `pointer-events-none`, `aria-hidden`, and pinned to `-z-10`
 * inside the section's own stacking context (HomeSection is `isolate`).
 */
export type SectionBackgroundVariant =
  | "terminal"
  | "radar"
  | "blueprint"
  | "arcade"
  | "aperture"
  | "manuscript"
  | "circuit"
  | "contour";

export function SectionBackground({
  variant,
  className,
}: {
  variant: SectionBackgroundVariant;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {VARIANTS[variant]()}
    </div>
  );
}

/** Single absolutely-positioned paint layer. */
function Layer({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
      style={style}
    />
  );
}

const VARIANTS: Record<SectionBackgroundVariant, () => ReactNode> = {
  // Ask — the M4RKYU.SYS terminal. Animated cell grid + drifting CRT
  // scanlines + a console glow from the top edge.
  terminal: () => (
    <>
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.18}
        duration={4.5}
        className="inset-[-1px] h-[calc(100%+2px)] w-[calc(100%+2px)] text-foreground/[0.1] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
      />
      <Layer
        className="opacity-70 motion-safe:animate-[section-scan_22s_linear_infinite]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 3px, color-mix(in srgb, var(--foreground) 8%, transparent) 4px)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(62% 50% at 50% 16%, color-mix(in srgb, var(--ring) 22%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "linear-gradient(to bottom, transparent 42%, color-mix(in srgb, var(--background) 78%, transparent))",
        }}
      />
    </>
  ),

  // Compass — an orientation map. Cyber grid base, concentric radar
  // rings, a crosshair, and a focal bloom dead-centre.
  radar: () => (
    <>
      <Layer className="bg-cyber-grid opacity-40" />
      <Layer
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 50% 50%, transparent 0 38px, color-mix(in srgb, var(--foreground) 12%, transparent) 38px 39.5px)",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent calc(50% - 0.5px), color-mix(in srgb, var(--foreground) 14%, transparent) 50%, transparent calc(50% + 0.5px)), linear-gradient(to bottom, transparent calc(50% - 0.5px), color-mix(in srgb, var(--foreground) 14%, transparent) 50%, transparent calc(50% + 0.5px))",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(42% 42% at 50% 50%, color-mix(in srgb, var(--ring) 19%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(125% 85% at 50% 50%, transparent 52%, color-mix(in srgb, var(--background) 70%, transparent))",
        }}
      />
    </>
  ),

  // Selected Work — the drafting table. Fine + coarse blueprint grids,
  // a sparse drifting particle field (signature animated), an accent
  // bloom upper-right, and top/bottom fades.
  blueprint: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--foreground) 9%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 9%, transparent) 1px, transparent 1px)",
          backgroundSize: "128px 128px",
        }}
      />
      <Particles quantity={24} maxOpacity={0.4} speed={0.08} size={1.3} />
      <Layer
        style={{
          background:
            "radial-gradient(70% 60% at 72% 28%, color-mix(in srgb, var(--ring) 13%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--background) 38%, transparent), transparent 24%, transparent 76%, color-mix(in srgb, var(--background) 52%, transparent))",
        }}
      />
    </>
  ),

  // Games — arcade cabinet. Dot-matrix field, drifting CRT scanlines,
  // a game-accent bloom from the floor.
  arcade: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1.4px, transparent 1.6px)",
          backgroundSize: "18px 18px",
        }}
      />
      <Layer
        className="opacity-90 motion-safe:animate-[section-scan_18s_linear_infinite]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 2px, color-mix(in srgb, var(--foreground) 7%, transparent) 3px)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(62% 58% at 50% 78%, color-mix(in srgb, var(--game-accent, var(--ring)) 24%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(125% 92% at 50% 50%, transparent 48%, color-mix(in srgb, var(--background) 72%, transparent))",
        }}
      />
    </>
  ),

  // Visual — the gallery contact sheet. A coarse, responsive frame grid
  // (fixed cell count) with a soft centre spotlight.
  aperture: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "25% 33.333%",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--ring) 34%, transparent) 1.5px, transparent 2px)",
          backgroundSize: "25% 33.333%",
          backgroundPosition: "0 0",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(55% 55% at 50% 44%, color-mix(in srgb, var(--ring) 10%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(125% 100% at 50% 50%, transparent 44%, color-mix(in srgb, var(--background) 78%, transparent))",
        }}
      />
    </>
  ),

  // Writing — editorial manuscript. Ruled baseline lines, a bold accent
  // margin rule, and a fine paper grain.
  manuscript: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 31px, color-mix(in srgb, var(--foreground) 6%, transparent) 31px 32px)",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent calc(12% - 1px), color-mix(in srgb, var(--ring) 26%, transparent) 12%, transparent calc(12% + 1px))",
        }}
      />
      <Layer className="noise-layer opacity-50" />
      <Layer
        style={{
          background:
            "radial-gradient(100% 70% at 50% 26%, color-mix(in srgb, var(--ring) 8%, transparent), transparent 70%)",
        }}
      />
    </>
  ),

  // Resources — the toolbench. Engineering graph paper with accent
  // solder-nodes at the coarse intersections.
  circuit: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--ring) 40%, transparent) 1.5px, transparent 2px)",
          backgroundSize: "96px 96px",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(62% 60% at 28% 30%, color-mix(in srgb, var(--ring) 12%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(125% 92% at 50% 50%, transparent 54%, color-mix(in srgb, var(--background) 66%, transparent))",
        }}
      />
    </>
  ),

  // About — topographic identity. Two offset contour fields from opposite
  // corners (the "places" motif) under a soft aurora glow.
  contour: () => (
    <>
      <Layer
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 28% 118%, transparent 0 28px, color-mix(in srgb, var(--foreground) 7%, transparent) 28px 30px)",
        }}
      />
      <Layer
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 86% -18%, transparent 0 34px, color-mix(in srgb, var(--foreground) 5%, transparent) 34px 36px)",
        }}
      />
      <Layer
        style={{
          background:
            "radial-gradient(60% 50% at 76% 24%, color-mix(in srgb, var(--ring) 14%, transparent), transparent 70%)",
        }}
      />
      <Layer
        style={{
          background:
            "linear-gradient(to bottom, transparent 48%, color-mix(in srgb, var(--background) 55%, transparent))",
        }}
      />
    </>
  ),
};
