"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The about masthead's name reveal. On view, the Chinese name 于震潇 types out
 * character by character behind a blinking caret; once it lands, the English
 * name resolves in big as the primary wordmark. Both stay — Mark Yu leads, the
 * Chinese identity holds beneath it. Reduced motion renders the settled state
 * (full Chinese + primary, no typing, no caret). The real <h1> carries an
 * `aria-label` with both names; the animated layers are aria-hidden.
 */
export function IdentityName({
  nameZh,
  namePrimary,
  className,
}: {
  nameZh: string;
  namePrimary: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const chars = Array.from(nameZh);
  const [typed, setTyped] = useState(0);
  const [showPrimary, setShowPrimary] = useState(false);

  useEffect(() => {
    // Reduced motion renders the settled state directly (derived below) — no
    // timers and no synchronous setState in the effect.
    if (reduced) return;
    // No ref guard here on purpose: under React Strict Mode the effect runs,
    // is cleaned up, then runs again. A "have I started?" ref would block the
    // second run from rescheduling and freeze the reveal. setTyped sets an
    // absolute index, so rescheduling is idempotent.
    const timers: ReturnType<typeof setTimeout>[] = [];
    const STEP = 240;
    const LEAD = 360;
    chars.forEach((_, i) => {
      timers.push(setTimeout(() => setTyped(i + 1), LEAD + i * STEP));
    });
    timers.push(
      setTimeout(() => setShowPrimary(true), LEAD + chars.length * STEP + 360),
    );
    return () => timers.forEach(clearTimeout);
    // chars.length is stable for a given name; effect runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Derived so reduced motion shows the resting state with no setState.
  const shownCount = reduced ? chars.length : typed;
  const primaryIn = reduced ? true : showPrimary;
  const typingDone = shownCount >= chars.length;

  return (
    <h1
      aria-label={`${namePrimary} · ${nameZh}`}
      className={cn("grid gap-1.5", className)}
    >
      {/* Chinese — types first, then holds as the strong secondary line. */}
      <span
        aria-hidden="true"
        className="inline-flex min-h-[1.1em] items-center font-display text-[clamp(1.5rem,3.6vw,2.75rem)] font-medium leading-none tracking-[0.04em] text-foreground/80"
      >
        {chars.slice(0, shownCount).join("")}
        {!reduced && !typingDone ? (
          <motion.span
            aria-hidden="true"
            className="ml-1 inline-block h-[0.9em] w-[0.06em] translate-y-[0.04em] bg-ring"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
          />
        ) : null}
      </span>

      {/* English — resolves in big as the primary wordmark once 于震潇 lands. */}
      <motion.span
        aria-hidden="true"
        className="block font-display text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.86] tracking-tight text-foreground"
        initial={reduced ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
        animate={
          primaryIn ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
        }
        // Inline carve-out: motion can't read --ease-premium, mirror it here.
        transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {namePrimary}
      </motion.span>
    </h1>
  );
}
