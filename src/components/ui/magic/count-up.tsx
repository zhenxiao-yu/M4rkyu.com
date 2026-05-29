"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

interface CountUpProps {
  value: number;
  /** Animation length in seconds. Default 0.9. */
  duration?: number;
  /** Override the rendered string (defaults to a localised integer). */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Animates a number from 0 up to `value` the first time it scrolls into
 * view, then settles. Driven by a MotionValue (no per-frame React state),
 * so it's cheap and never trips the set-state-in-effect rule. Reduced-motion
 * users get the final number immediately.
 */
export function CountUp({
  value,
  duration = 0.9,
  format,
  className,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const count = useMotionValue(0);
  const formatValue = format ?? ((n: number) => Math.round(n).toLocaleString());
  const text = useTransform(count, (current) => formatValue(current));

  useEffect(() => {
    if (reduce || !inView) {
      count.set(reduce ? value : 0);
      return;
    }
    const controls = animate(count, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [value, inView, reduce, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}
