"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  /** Words to cycle through. */
  words: readonly string[];
  /** Milliseconds between swaps. Default 3000. */
  intervalMs?: number;
  className?: string;
}

// Cycle words with y-slide; reduced-motion stays on the first word. Port of ReactBits RotatingText.
export function RotatingText({
  words,
  intervalMs = 3000,
  className,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (words.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [words.length, intervalMs, reduce]);

  if (reduce) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className={cn("relative inline-flex overflow-hidden align-baseline", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.36, ease: [0.2, 0.7, 0.2, 1] }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
