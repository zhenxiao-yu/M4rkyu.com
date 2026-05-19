"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShuffleProps {
  /** Text to shuffle. */
  text: string;
  /** Seconds the per-char scramble lasts before locking back. */
  duration?: number;
  /** Loop the effect — a periodic pulse, not a continuous shimmer. */
  loop?: boolean;
  /** Seconds between pulses (only meaningful when `loop` is true). */
  loopDelay?: number;
  /**
   * Fraction (0-1) of non-space chars that scramble in each pulse.
   * Defaults to a small fraction so the effect reads as occasional
   * letters flickering, not the whole word recomposing.
   */
  density?: number;
  /** Pool of glyphs cycled through during the scramble. */
  charset?: string;
  /** Fire an extra pulse on hover/focus. */
  triggerOnHover?: boolean;
  /** "up" — replacement glyph slides up into place; "down" — opposite. */
  shuffleDirection?: "up" | "down";
  className?: string;
}

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Per-char scramble pulse — layout stable via inline-grid (invisible target spacer under animated overlay). Reduced-motion = static.
export function Shuffle({
  text,
  duration = 0.45,
  loop = false,
  loopDelay = 5,
  density = 0.2,
  charset = DEFAULT_CHARS,
  triggerOnHover = true,
  shuffleDirection = "up",
  className,
}: ShuffleProps) {
  const reduce = useReducedMotion();
  const chars = text.split("");
  const [pulses, setPulses] = useState<number[]>(() => chars.map(() => 0));

  const firePulse = useCallback(() => {
    if (reduce) return;
    setPulses((prev) => {
      const eligible: number[] = [];
      for (let i = 0; i < chars.length; i += 1) {
        if (chars[i] !== " ") eligible.push(i);
      }
      if (eligible.length === 0) return prev;
      const count = Math.max(
        1,
        Math.min(eligible.length, Math.round(eligible.length * density)),
      );
      const picks = new Set<number>();
      while (picks.size < count) {
        picks.add(eligible[Math.floor(Math.random() * eligible.length)]!);
      }
      return prev.map((v, i) => (picks.has(i) ? v + 1 : v));
    });
  }, [chars, density, reduce]);

  useEffect(() => {
    if (!loop || reduce) return;
    const id = setInterval(firePulse, loopDelay * 1000);
    return () => clearInterval(id);
  }, [loop, loopDelay, firePulse, reduce]);

  if (reduce) {
    return (
      <span aria-label={text} className={cn("inline-block", className)}>
        <span aria-hidden="true">{text}</span>
      </span>
    );
  }

  return (
    <span
      aria-label={text}
      className={cn("inline-block", className)}
      onMouseEnter={triggerOnHover ? firePulse : undefined}
      onFocus={triggerOnHover ? firePulse : undefined}
    >
      <span aria-hidden="true" className="inline-block">
        {chars.map((char, i) => (
          <ShuffleCell
            key={i}
            target={char}
            pulseId={pulses[i] ?? 0}
            duration={duration}
            charset={charset}
            direction={shuffleDirection}
          />
        ))}
      </span>
    </span>
  );
}

function ShuffleCell({
  target,
  pulseId,
  duration,
  charset,
  direction,
}: {
  target: string;
  pulseId: number;
  duration: number;
  charset: string;
  direction: "up" | "down";
}) {
  // `tick` increments every reel-step (and again on settle), so the
  // motion key swaps each step and AnimatePresence runs enter/exit.
  const [tick, setTick] = useState(0);
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    if (target === " ") return;
    // Skip the first render — we don't want every cell to animate on
    // mount; only when its `pulseId` actually advances.
    if (pulseId === 0) return;

    let cancelled = false;
    const tickMs = 130;
    const ticksPerScramble = Math.max(1, Math.round((duration * 1000) / tickMs));
    let i = 0;

    const id = setInterval(() => {
      if (cancelled) return;
      i += 1;
      if (i >= ticksPerScramble) {
        clearInterval(id);
        setCurrent(target);
        setTick((t) => t + 1);
        return;
      }
      setCurrent(
        charset[Math.floor(Math.random() * charset.length)] ?? target,
      );
      setTick((t) => t + 1);
    }, tickMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pulseId, target, duration, charset]);

  if (target === " ") {
    return <span className="inline-block">&nbsp;</span>;
  }

  const enterY = direction === "up" ? "0.22em" : "-0.22em";
  const exitY = direction === "up" ? "-0.22em" : "0.22em";

  return (
    <span className="relative inline-grid align-baseline">
      {/* Sizer: real text in the flow, invisible. Locks the cell's
          width + baseline so the animated overlay can swap glyphs
          without shifting neighbors. */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {target}
      </span>
      <span className="col-start-1 row-start-1">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={tick}
            initial={{ y: enterY, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: exitY, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="inline-block"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
