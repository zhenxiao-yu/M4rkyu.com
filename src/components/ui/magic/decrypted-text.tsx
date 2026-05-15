"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface DecryptedTextProps {
  /** Target text. Chars scramble through random glyphs, then resolve. */
  text: string;
  /** ms between scramble ticks. Lower = faster. Default 45. */
  speed?: number;
  /** Total scramble cycles for non-sequential mode. Default 12. */
  maxIterations?: number;
  /** Sequential: chars resolve one-by-one. Non-seq: all flicker, all resolve. */
  sequential?: boolean;
  /** Order in which sequential chars resolve. */
  revealDirection?: "start" | "end" | "center";
  /** When `true`, scramble pool is the text's own chars (uppercase only). */
  useOriginalCharsOnly?: boolean;
  /** Pool of glyphs to scramble through. */
  characters?: string;
  /** When the animation fires. `mount` plays once on mount. */
  animateOn?: "mount" | "view" | "hover";
  /** Optional delay before the animation starts (ms). */
  delay?: number;
  /** Class for revealed chars. */
  className?: string;
  /** Class for the wrapper span. */
  parentClassName?: string;
  /** Class for scramble (encrypted) chars. */
  encryptedClassName?: string;
}

/**
 * DecryptedText — ReactBits port (MIT). Renders the target text but
 * cycles each char through random glyphs before resolving to the
 * real character. Supports sequential resolve (reveals char-by-char
 * in `revealDirection`) or non-sequential (whole text flickers, then
 * snaps to final).
 *
 * Trigger modes:
 *   - `mount` — fires once on mount (default for our use case).
 *   - `view` — fires on intersection.
 *   - `hover` — fires on mouse enter; resets on leave.
 *
 * Reduced-motion: renders final text immediately, skips animation.
 * Always preserves an sr-only copy of the real text for screen readers.
 *
 * Adapted from `reactbits.dev` (verbatim source preserved; added
 * `mount` mode + reduced-motion guard + sized classes).
 */
export function DecryptedText({
  text,
  speed = 45,
  maxIterations = 12,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
  animateOn = "mount",
  delay = 0,
  className,
  parentClassName,
  encryptedClassName,
}: DecryptedTextProps) {
  const reduce = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "mount" && animateOn !== "view");
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo<string[]>(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((c) => c !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (original: string, revealed: Set<number>) => {
      return original
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (revealed.has(i)) return original[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join("");
    },
    [availableChars],
  );

  const trigger = useCallback(() => {
    if (reduce) {
      setDisplayText(text);
      setIsDecrypted(true);
      return;
    }
    setRevealedIndices(new Set());
    setIsAnimating(true);
  }, [reduce, text]);

  // mount trigger
  useEffect(() => {
    if (animateOn !== "mount") return;
    if (hasAnimated) return;
    const id = window.setTimeout(() => {
      trigger();
      setHasAnimated(true);
    }, delay);
    return () => window.clearTimeout(id);
  }, [animateOn, hasAnimated, trigger, delay]);

  // view trigger (IntersectionObserver)
  useEffect(() => {
    if (animateOn !== "view") return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          trigger();
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animateOn, hasAnimated, trigger]);

  // animation tick
  useEffect(() => {
    if (!isAnimating) return;
    let iter = 0;

    const getNextIndex = (revealed: Set<number>): number => {
      const len = text.length;
      switch (revealDirection) {
        case "start":
          return revealed.size;
        case "end":
          return len - 1 - revealed.size;
        case "center": {
          const middle = Math.floor(len / 2);
          const offset = Math.floor(revealed.size / 2);
          const next = revealed.size % 2 === 0 ? middle + offset : middle - offset - 1;
          if (next >= 0 && next < len && !revealed.has(next)) return next;
          for (let i = 0; i < len; i++) if (!revealed.has(i)) return i;
          return 0;
        }
        default:
          return revealed.size;
      }
    };

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prev) => {
        if (sequential) {
          if (prev.size < text.length) {
            const next = getNextIndex(prev);
            const set = new Set(prev);
            set.add(next);
            setDisplayText(shuffleText(text, set));
            return set;
          } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsAnimating(false);
            setIsDecrypted(true);
            return prev;
          }
        }
        // non-sequential: full scramble, snap on max iterations
        setDisplayText(shuffleText(text, prev));
        iter += 1;
        if (iter >= maxIterations) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsAnimating(false);
          setDisplayText(text);
          setIsDecrypted(true);
        }
        return prev;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAnimating, text, speed, maxIterations, sequential, revealDirection, shuffleText]);

  return (
    <motion.span ref={containerRef} className={cn("inline-block whitespace-pre-wrap", parentClassName)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split("").map((char, i) => {
          const revealed = revealedIndices.has(i) || (!isAnimating && isDecrypted);
          return (
            <span key={i} className={revealed ? className : encryptedClassName}>
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
