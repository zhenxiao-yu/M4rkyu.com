"use client";

// Adapted from Magic UI · BlurFade · phase 1.2 redesign

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  blur?: string;
  className?: string;
  once?: boolean;
}

export function BlurFade({
  children,
  delay = 0,
  duration = 0.5,
  blur = "6px",
  className,
  once = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: `blur(${blur})`, y: 8 }}
      animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
      // Cubic-bezier mirrors --ease-premium; motion's transition.ease cannot read CSS variables.
      transition={{ delay, duration, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
