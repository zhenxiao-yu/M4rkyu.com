"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Fade-into-footer — a restrained "approach" transition where the bottom of the
 * page dissolves toward the footer credits. A short token-only fade ledge sits
 * just above the footer (cooperating with the footer's own border-t + bottom
 * ring glow, never a competing third gradient), and the footer eases to full as
 * it scrolls in.
 *
 * The FooterSceneFloor wordmark stays the hero moment — this only handles the
 * approach, so the two don't double up. Reduced motion renders the children
 * plain (no ledge, no tween). The async server <Footer> is passed as children;
 * this client wrapper just adds behaviour around it.
 */
export function FooterReveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  if (reduce) {
    return (
      <div ref={ref} className="relative">
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {/* Approach fade ledge — the last of the page dissolves into the footer,
          sitting just above its border so the credits read as a settling. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 -translate-y-full bg-linear-to-b from-transparent to-background"
      />
      <motion.div style={{ opacity }}>{children}</motion.div>
    </div>
  );
}
