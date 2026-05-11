"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Plugin registration runs once per client bundle on first import.
// Server-side import is harmless because `gsap.registerPlugin` no-ops
// before any DOM use, but everything that *uses* these plugins must
// live inside a "use client" component.
gsap.registerPlugin(ScrollTrigger, SplitText);

// Centralized motion-token defaults. Components should read these
// instead of typing literals so the editorial pacing stays consistent
// with the rest of the site's motion/react surfaces (motion-fast =
// ~180ms, premium = quart-out curve).
export const motionTokens = {
  fast: 0.18,
  base: 0.36,
  slow: 0.6,
  // Match `--ease-premium` from globals.css — a slightly snappier
  // cubic-bezier than the GSAP default `power2.out`, designed to
  // pair with the rest of the site's transitions without feeling
  // looser.
  easePremium: "cubic-bezier(0.2, 0.7, 0.2, 1)",
} as const;

/**
 * Returns true if the user has `prefers-reduced-motion: reduce` set.
 * Components should short-circuit their GSAP setup when this returns
 * true — render the final state, register no tweens.
 *
 * Safe to call on the server (returns false). The boolean updates
 * reactively in components only when paired with `useReducedMotion`
 * from motion/react; this helper is for one-shot reads inside
 * `useGSAP` effects.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText };
