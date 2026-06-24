"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { GhostedWord } from "@/components/ui/magic/ghosted-word";
import { ShinyText } from "@/components/ui/magic/shiny-text";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { FooterMoonScene } from "./footer-moon-scene";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The end-credits floor: an oversized M4RKYU wordmark with the orbiting moon
 * behind it, lifting and un-skewing as the footer scrolls into view. The
 * scroll transforms are no-ops under prefers-reduced-motion (the cluster just
 * sits at rest), and the orbit + wordmark pointer-pull each gate themselves.
 */
export function FooterSceneFloor({
  locale,
  name,
  sinceLabel,
}: {
  locale: Locale;
  name: string;
  sinceLabel: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  // Hooks must run unconditionally; we just don't bind them when reduced.
  const skewX = useTransform(scrollYProgress, [0, 1], [-5, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [44, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [0.35, 1]);

  return (
    <div
      ref={ref}
      className="relative isolate grid place-items-center gap-5 overflow-hidden py-14 sm:py-20"
    >
      {/* Back layer — moon + orbital-plane rings behind the glyphs */}
      <FooterMoonScene layer="back" className="-z-10" />

      <motion.div
        style={reduce ? undefined : { skewX, y, opacity }}
        className="relative z-10 grid w-full place-items-center gap-5"
      >
        <Link
          href="/"
          locale={locale}
          aria-label="M4rkyu.com"
          className={cn("group block w-full text-center leading-none", FOCUS_RING)}
        >
          <GhostedWord
            text="M4RKYU"
            ghosts={6}
            spread={22}
            className="font-wordmark text-[clamp(3.25rem,15vw,14rem)] font-bold leading-[0.95] tracking-[-0.04em] text-foreground/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
          />
        </Link>

        <div className="flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-10 bg-border sm:w-16" />
          <ShinyText duration={6}>{sinceLabel}</ShinyText>
          <span aria-hidden="true" className="h-px w-10 bg-border sm:w-16" />
        </div>

        <div className="hidden text-center text-[0.6rem] font-mono uppercase tracking-[0.28em] text-muted-foreground/70 sm:block">
          <DecryptedText
            text={name}
            animateOn="view"
            sequential
            revealDirection="center"
            speed={55}
            useOriginalCharsOnly
          />
        </div>
      </motion.div>

      {/* Front layer — same shared orbit, painted over the glyphs so the moon
          passes in front of the letters on the near half of its path */}
      <FooterMoonScene layer="front" className="z-20" />
    </div>
  );
}
