"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

interface HudScrollFrameProps {
  children: ReactNode;
}

/**
 * Subtle scroll-tied opacity ramp for the homepage HUD strip. Maps the
 * first 100px of page scroll to an opacity ramp from 1.0 → 0.7 — no
 * y-translation, no scale, no parallax. Reduced-motion users see a
 * static opacity of 1.0.
 *
 * Intentionally thin: GameHud stays a server component, this is a
 * presentational frame that wraps it on the home route only. Keeps the
 * client boundary as small as possible per the architecture doctrine.
 */
export function HudScrollFrame({ children }: HudScrollFrameProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  // `useTransform` is always called (rules of hooks). When reduced
  // motion is on we ignore the mapped value and render at opacity 1.0.
  const opacity = useTransform(scrollY, [0, 100], [1, 0.7], {
    clamp: true,
  });

  if (reduceMotion) {
    return <div>{children}</div>;
  }

  return <motion.div style={{ opacity }}>{children}</motion.div>;
}
