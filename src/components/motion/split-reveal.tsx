"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, motionTokens, prefersReducedMotion } from "@/lib/gsap";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

interface SplitRevealProps {
  /** The text to reveal. Plain string so the split + aria-label stay honest. */
  children: string;
  /** Element to render. Default `h2`. */
  as?: Tag;
  className?: string;
  /** Granularity of the stagger. `lines` reads as the most editorial. */
  splitBy?: "lines" | "words";
  /** Delay before the first piece, seconds. */
  delay?: number;
  /** Stagger between pieces, seconds. */
  stagger?: number;
}

/**
 * Editorial heading reveal — line/word splits the text and staggers each piece
 * up + de-blurs into place when it scrolls into view. Uses the project's
 * already-loaded GSAP `SplitText` (`src/lib/gsap.ts`); triggered by
 * motion/react `useInView` (NOT ScrollTrigger, which stays home-route-only by
 * contract). Reduced-motion renders the plain string — no split, no tween. The
 * split spans are `aria-hidden` behind the host's `aria-label`, and the split
 * is reverted on complete + unmount so copy/paste and AT see clean text.
 */
export function SplitReveal({
  children,
  as = "h2",
  className,
  splitBy = "lines",
  delay = 0,
  stagger = 0.09,
}: SplitRevealProps) {
  const Tag = as;
  const hostRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(hostRef, { once: true, margin: "0px 0px -12% 0px" });

  useGSAP(
    () => {
      if (!inView || !innerRef.current || prefersReducedMotion()) return;

      const split = new SplitText(innerRef.current, { type: splitBy });
      const targets = splitBy === "lines" ? split.lines : split.words;

      gsap.from(targets, {
        yPercent: 60,
        opacity: 0,
        filter: "blur(6px)",
        duration: motionTokens.slow,
        ease: motionTokens.easePremium,
        stagger,
        delay,
        onComplete: () => split.revert(),
      });

      return () => split.revert();
    },
    { scope: hostRef, dependencies: [inView] },
  );

  return (
    // @ts-expect-error — dynamic tag; ref type narrows per element at runtime.
    <Tag ref={hostRef} className={className} aria-label={children}>
      {/* `block` so the text wraps at the heading width (an inline-block would
       * shrink to content and break line-splitting). */}
      <span ref={innerRef} aria-hidden="true" className="block">
        {children}
      </span>
    </Tag>
  );
}
