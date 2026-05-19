"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

// One of the CSS pattern utilities defined in globals.css. `none` skips
// the overlay; useful when the card already has its own background
// graphic (e.g. the travel map).
export type BentoPattern =
  | "cyber-grid"
  | "dots"
  | "diag"
  | "radial"
  | "scanline"
  | "none";

interface BentoFxProps {
  pattern?: BentoPattern;
  /** Disable the cursor spotlight (e.g. for cards that don't need it). */
  spotlight?: boolean;
  className?: string;
  children: ReactNode;
}

const patternClass: Record<Exclude<BentoPattern, "none">, string> = {
  "cyber-grid": "bg-cyber-grid",
  dots: "bento-dots",
  diag: "bento-diag",
  radial: "bento-radial",
  scanline: "scanline-layer",
};

export const bentoCardVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] as const },
  },
};

/**
 * Decorative wrapper for an about-page bento card. Adds:
 *  - a token-driven background pattern overlay
 *  - a pointer-tracked cursor spotlight (mouse only)
 *  - a hover border glow using the --ring accent
 *
 * Honors reduced-motion (spotlight skipped) and pointer:fine (only
 * mouse moves drive the spotlight — touch is filtered at the event
 * level).
 */
export function BentoFx({
  pattern = "none",
  spotlight = true,
  className,
  children,
}: BentoFxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Normalized pointer position within the card, -0.5 .. 0.5.
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  // Spotlight position as percentages for the radial-gradient.
  const sxPct = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const syPct = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const spotlightBg = useMotionTemplate`radial-gradient(280px circle at ${sxPct} ${syPct}, color-mix(in srgb, var(--ring) 18%, transparent), transparent 70%)`;

  const enableSpotlight = spotlight && !reduced;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.div
      ref={ref}
      variants={reduced ? undefined : bentoCardVariant}
      onPointerMove={enableSpotlight ? onPointerMove : undefined}
      onPointerLeave={enableSpotlight ? onPointerLeave : undefined}
      className={cn(
        "group/bento relative h-full rounded-lg",
        "transition-shadow duration-(--motion-fast) ease-(--ease-premium)",
        "hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--ring)_30%,transparent),0_22px_60px_-32px_color-mix(in_srgb,var(--ring)_50%,transparent)]",
        className,
      )}
    >
      {pattern !== "none" ? (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-[inherit] opacity-25 transition-opacity duration-(--motion-fast) ease-(--ease-premium) group-hover/bento:opacity-40",
            patternClass[pattern],
          )}
        />
      ) : null}

      {children}

      {enableSpotlight ? (
        <motion.div
          aria-hidden="true"
          style={{ background: spotlightBg }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-(--motion-fast) ease-(--ease-premium) group-hover/bento:opacity-100"
        />
      ) : null}
    </motion.div>
  );
}

export const bentoGridVariant = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

/**
 * Animated grid wrapper for the about bento. Plays a staggered fade-up
 * once when the grid scrolls into view.
 */
export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={bentoGridVariant}
      className={className}
    >
      {children}
    </motion.div>
  );
}
