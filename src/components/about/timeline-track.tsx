"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { Profile } from "@/content/schemas";

interface TimelineTrackProps {
  timeline: Profile["timeline"];
  nowLabel: string;
  nowBody: string;
}

const node = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] as const },
  },
};

/**
 * Animated route timeline: the spine draws down as the card enters
 * view and each stop fades in along it, with the dot scaling up. The
 * final dashed "now" node hover-pulses. Reduced-motion renders the
 * fully-revealed list with no animation.
 *
 * The track fills its column (`h-full` + `justify-between`) so the
 * "route" runs the full height of the bento cell rather than sitting
 * in a short scroll box with empty space beneath it.
 */
export function TimelineTrack({ timeline, nowLabel, nowBody }: TimelineTrackProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const active = reduced || inView;

  return (
    <div ref={ref} className="relative h-full min-h-72">
      {/* Drawing spine sits behind the per-item left borders. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1.5 w-px origin-top bg-linear-to-b from-ring/70 via-border to-transparent"
        style={{ bottom: "0.5rem" }}
        initial={reduced ? false : { scaleY: 0 }}
        animate={active ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
      />

      <motion.div
        className="flex h-full flex-col justify-between gap-5"
        initial={reduced ? false : "hidden"}
        animate={active ? "visible" : "hidden"}
        transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
      >
        {timeline.map((item) => (
          <motion.div
            key={item.label}
            variants={reduced ? undefined : node}
            className="group/stop relative border-l border-transparent pl-5"
          >
            <motion.span
              className="absolute -left-1 top-1.5 size-2 rounded-full bg-ring"
              initial={reduced ? false : { scale: 0 }}
              animate={active ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            />
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
              {item.date}
            </p>
            <h2 className="mt-1 text-sm font-semibold transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover/stop:text-ring">
              {item.label}
            </h2>
            <p className="mt-1 max-w-[32ch] text-xs leading-5 text-muted-foreground">
              {item.detail}
            </p>
          </motion.div>
        ))}

        <motion.div
          variants={reduced ? undefined : node}
          className="relative border-l border-dashed pl-5"
        >
          <span className="absolute -left-1 top-1.5 size-2 rounded-full border border-ring bg-background">
            {!reduced ? (
              <motion.span
                className="absolute inset-0 rounded-full bg-ring/40"
                animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
          </span>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            {nowLabel}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{nowBody}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
