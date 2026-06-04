"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface KineticHeadingProps {
  text: string;
  className?: string;
  /** Delay before the first word, in seconds. Default 0.1. */
  delay?: number;
}

const container = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
};

const word = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    // Mirrors --ease-premium; motion's transition.ease can't read CSS vars.
    transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const },
  },
};

/**
 * Word-by-word reveal for a hero heading: each word rises and
 * de-blurs in sequence. Reduced-motion renders the plain string so the
 * title is never animated for users who opt out.
 */
export function KineticHeading({
  text,
  className,
  delay = 0.1,
}: KineticHeadingProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      className={className}
      variants={container}
      custom={delay}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          aria-hidden="true"
        >
          <motion.span
            variants={word}
            className={cn("inline-block", i < words.length - 1 && "mr-[0.22em]")}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
}
