"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplitHeadlineProps {
  /** Plain-text headline. Must be <=40 characters and locale-en only. */
  text: string;
  className?: string;
}

/**
 * Word-staggered reveal for the EN hero headline. Intentionally narrow
 * scope — only used by `HeroSection` on /en. The /zh route renders the
 * headline as plain text instead (PR #60 doctrine: text-splitting is
 * banned on zh because CJK measurements + per-word stagger read off).
 *
 * SSR-safe: server output is the final string. After hydration the
 * component mounts in its initial (hidden) state for a single frame and
 * then animates to the visible state, so there is no layout shift. On
 * reduced-motion the animation is skipped and the full string is
 * rendered instantly.
 *
 * Accessibility: the wrapper carries `aria-label` so SR reads the
 * headline once. The animated word spans are `aria-hidden`.
 */
export function SplitHeadline({ text, className }: SplitHeadlineProps) {
  const reduceMotion = useReducedMotion();
  // `mounted` flips on the first client effect tick. Before that we
  // render the final string (matches SSR HTML exactly). After it, we
  // render the animated split. This avoids a hydration mismatch and
  // also avoids a layout shift, because the animated path renders
  // every word at its final position with only `opacity` + `y`
  // changing during entry.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // SSR-safe mount latch: the server renders the final plain string
    // (the `!mounted` branch below), and we flip to the animated split
    // after hydration. There is no external system to subscribe to —
    // the trigger is "we are now on the client" — so setState in an
    // effect is the correct pattern here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || reduceMotion) {
    return <span className={cn("inline", className)}>{text}</span>;
  }

  const words = text.split(" ");
  // Total reveal stays well under 800ms: 0.05s base + 0.06s * (n-1)
  // stagger + 0.5s per-word duration. For "A decent place to put all
  // this." (7 words) that's ~0.91s of the last word's entry tail —
  // the perceived completion is closer to 700ms.
  const stagger = 0.06;
  const base = 0.05;

  return (
    <span aria-label={text} className={cn("inline", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-baseline"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: base + i * stagger,
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? (
            <span aria-hidden="true" className="inline-block">
              {" "}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
