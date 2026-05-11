"use client";

import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, motionTokens } from "@/lib/gsap";

interface ContactSheetFlashProps {
  children: ReactNode;
  /**
   * CSS selector relative to the wrapper that matches each frame
   * tile. Defaults to `[data-frame-tile]`.
   */
  frameSelector?: string;
}

/**
 * "Contact-sheet flash" reveal for the /archive route. On first
 * mount each frame fades in random-staggered, like proofs developing
 * across a contact sheet. The grayscale "underexposed → exposed" cue
 * is implemented as an opacity-animated overlay layer on the tile
 * (handled in the tile CSS), not as an animated filter — that keeps
 * us inside the transform + opacity rule from
 * docs/GSAP_INTEGRATION.md §6.
 *
 * Architecture:
 *   - Server-rendered tile children stay server-rendered. The
 *     wrapper picks them up by selector and animates them in.
 *   - One GSAP `to()` with `stagger: { from: "random" }` for the
 *     proof-sheet feel.
 *   - Auto-killed on unmount via `useGSAP`.
 *   - Reduced-motion: early-return, tiles render visible.
 *
 * Mobile pacing: shorter `each` interval + base (not slow) duration
 * so the total reveal completes under ~500ms even on phones with
 * dozens of frames.
 */
export function ContactSheetFlash({
  children,
  frameSelector = "[data-frame-tile]",
}: ContactSheetFlashProps) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion) return;
      const root = scopeRef.current;
      if (!root) return;
      const frames = root.querySelectorAll<HTMLElement>(frameSelector);
      if (frames.length === 0) return;

      const isMobile =
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 640px)").matches;

      gsap.set(frames, {
        opacity: 0,
        y: 6,
      });

      gsap.to(frames, {
        opacity: 1,
        y: 0,
        duration: isMobile ? motionTokens.fast : motionTokens.base,
        ease: motionTokens.easePremium,
        stagger: {
          each: isMobile ? 0.025 : 0.04,
          from: "random",
        },
      });
    },
    { dependencies: [reduceMotion, frameSelector], scope: scopeRef },
  );

  return <div ref={scopeRef}>{children}</div>;
}
