"use client";

import { Fragment, useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { GlitchText } from "@/components/motion/glitch-text";
import { cn } from "@/lib/utils";

// Mirrors --ease-premium; motion's transition.ease cannot read CSS vars,
// so the curve is duplicated here (same carve-out as the other primitives).
const EASE = [0.2, 0.7, 0.2, 1] as const;

export type HeadingRevealVariant = "editorial" | "glitch" | "static";

interface HeadingRevealProps {
  title: string;
  eyebrow?: string;
  description?: string;
  /** Heading level. `h1` on hero/archive index pages; `h2` elsewhere. */
  as?: "h1" | "h2";
  /**
   * Title microinteraction. Defaults: `h1` → `glitch` (single-shot RGB
   * split, the hero signature), `h2` → `editorial` (per-word de-blur rise).
   */
  variant?: HeadingRevealVariant;
  /** Typographic classes applied to the heading element. */
  titleClassName?: string;
  /** Risograph two-ink overprint (`m4-overprint` + `data-text`) — h1 hero. */
  overprint?: boolean;
}

/**
 * The site-wide heading microinteraction system. One coordinated, scroll-
 * triggered entrance for every eyebrow + title + description:
 *
 * - the eyebrow's kinetic three-ink rule **wipes in** from the left while its
 *   label slides up;
 * - the title reveals per its `variant` — `glitch` (hero h1) keeps the
 *   single-shot RGB split; `editorial` (section h2) staggers each word up and
 *   de-blurs it into place; `static` renders plain;
 * - the description **blur-fades** up after the title lands.
 *
 * Built on `motion/react` only (no GSAP, so a bare heading never pulls the
 * GSAP runtime into a page's client bundle). Honours `useReducedMotion()`:
 * the reduced path renders the final composition with no transforms and no
 * glitch. Word spans are `aria-hidden` behind the heading's `aria-label`, so
 * assistive tech and crawlers read clean text.
 */
export function HeadingReveal({
  title,
  eyebrow,
  description,
  as = "h2",
  variant,
  titleClassName,
  overprint = false,
}: HeadingRevealProps) {
  const Heading = as;
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const resolved: HeadingRevealVariant =
    variant ?? (as === "h1" ? "glitch" : "editorial");

  const headingClassName = cn(titleClassName, overprint && "m4-overprint");
  const dataText = overprint ? title : undefined;

  // Reduced motion → the final, settled composition. No transforms, no glitch.
  if (reduce) {
    return (
      <div ref={ref} className="max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="kinetic-rule h-0.75 w-9 shrink-0 rounded-full"
            />
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <Heading className={headingClassName} data-text={dataText}>
          {title}
        </Heading>
        {description ? (
          <p className="mt-4 max-w-2xl font-prose text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    );
  }

  const titleStart = eyebrow ? 0.14 : 0.02;
  const words = title.split(" ");
  // Cap the per-word stagger so very long titles still resolve promptly.
  const titleSpan = Math.min(words.length, 7) * 0.05;
  const descDelay =
    titleStart + (resolved === "editorial" ? titleSpan : 0.18) + 0.08;

  return (
    <div ref={ref} className="max-w-3xl">
      {eyebrow ? (
        <div className="flex items-center gap-3">
          {/* Kinetic three-ink tick wipes in from the left. */}
          <motion.span
            aria-hidden="true"
            className="kinetic-rule h-0.75 w-9 shrink-0 origin-left rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={inView ? { scaleX: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.5, ease: EASE }}
          />
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
            initial={{ opacity: 0, x: -6 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
          >
            {eyebrow}
          </motion.p>
        </div>
      ) : null}

      {resolved === "glitch" ? (
        <Heading className={headingClassName} data-text={dataText}>
          <GlitchText>{title}</GlitchText>
        </Heading>
      ) : resolved === "static" ? (
        <Heading className={headingClassName} data-text={dataText}>
          {title}
        </Heading>
      ) : (
        <Heading
          aria-label={title}
          className={headingClassName}
          data-text={dataText}
        >
          {words.map((word, i) => (
            <Fragment key={i}>
              <motion.span
                aria-hidden="true"
                className="inline-block"
                initial={{ y: "0.5em", opacity: 0, filter: "blur(6px)" }}
                animate={
                  inView ? { y: 0, opacity: 1, filter: "blur(0px)" } : undefined
                }
                transition={{
                  delay: titleStart + Math.min(i, 7) * 0.05,
                  duration: 0.6,
                  ease: EASE,
                }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </Heading>
      )}

      {description ? (
        <motion.p
          className="mt-4 max-w-2xl font-prose text-base leading-7 text-muted-foreground"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={
            inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined
          }
          transition={{ delay: descDelay, duration: 0.5, ease: EASE }}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  );
}
