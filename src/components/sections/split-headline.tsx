"use client";

import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, motionTokens } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface SplitHeadlineProps {
  /** Plain-text headline. Must be <=40 characters and locale-en only. */
  text: string;
  className?: string;
}

/**
 * Char-level staggered reveal for the EN hero headline. Powered by
 * GSAP SplitText so multi-line wrapping, ligatures, and per-character
 * masks are correct without hand-rolling word-splitting logic.
 *
 * Scope guards (carried forward from the motion/react predecessor):
 *
 *   - EN-only. `HeroSection` gates on `locale === "en"` and renders
 *     the plain string on /zh because per-char stagger on CJK reads
 *     off (text-splitting is banned on zh per
 *     docs/INTERACTION_TECHNIQUES.md §5).
 *
 *   - SSR-safe. Before hydration the server renders the final plain
 *     string. The `mounted` latch flips on the first effect tick,
 *     after which GSAP takes over and animates from the initial
 *     hidden state to the final position. There is no layout shift
 *     because SplitText preserves the original line breaks and the
 *     entry tween only animates `yPercent` + `opacity`.
 *
 *   - Reduced-motion. The hook short-circuits when the user has
 *     `prefers-reduced-motion: reduce` set — the plain string
 *     renders, no GSAP timeline is created.
 *
 *   - Accessible. The wrapper carries `aria-label` so SR reads the
 *     headline once. SplitText's generated char/word spans are
 *     `aria-hidden` via the `aria` config below.
 *
 * Why GSAP over motion/react: SplitText handles the multi-line clip
 * mask correctly when the headline wraps (the `mask` div per line
 * keeps overflow hidden), which the prior word-stagger approach
 * couldn't do without measuring text manually.
 */
export function SplitHeadline({ text, className }: SplitHeadlineProps) {
  const reduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted || reduceMotion) return;
      const target = wrapperRef.current;
      if (!target) return;

      const split = SplitText.create(target, {
        type: "chars,words,lines",
        // GSAP injects role/aria-label on the wrapper; we keep
        // aria-label on our own outer span (set below in JSX) and
        // mark the inner generated nodes aria-hidden so SR doesn't
        // double-read each character.
        aria: "hidden",
        mask: "lines",
        linesClass: "split-line",
      });

      gsap.fromTo(
        split.chars,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: motionTokens.slow,
          ease: motionTokens.easePremium,
          stagger: 0.02,
          delay: 0.05,
        },
      );

      return () => {
        split.revert();
      };
    },
    { dependencies: [mounted, reduceMotion, text], scope: wrapperRef },
  );

  return (
    <span
      ref={wrapperRef}
      aria-label={text}
      className={cn("inline-block", className)}
    >
      {text}
    </span>
  );
}
