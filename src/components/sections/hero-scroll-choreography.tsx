"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, registerScrollTrigger } from "@/lib/gsap";
import { setHeroExitProgress } from "@/lib/hero-scroll-progress";

/**
 * Hero exit choreography — the one scrubbed timeline the home's
 * Lenis→`gsap.ticker` bridge (`home-smooth-scroll.tsx`) was built for.
 *
 * As the stage scrolls away the wordmark lifts, eases back, blurs and fades
 * into the scroll-cinema act below; the scroll cue retires within the first
 * slice of the descent. The exit blur is the deliberate hand-off into
 * `HeroCinema` (the documented scroll-cinema direction) — scoped to the brief
 * exit window only, so the R3F/Waves perf budget upstream is untouched.
 *
 * The island renders an inert anchor span and reads the hero section via
 * `closest(...)`, so the server-rendered `HeroSection` markup stays put and
 * we only attach behaviour. Reduced-motion: returns early and leaves the
 * hero fully legible at rest.
 */
export function HeroScrollChoreography() {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    const section = anchor.closest<HTMLElement>(
      '[data-home-section="stage"]',
    );
    if (!section) return;

    let cancelled = false;
    let ctx: ReturnType<typeof gsap.context> | null = null;

    (async () => {
      const ST = await registerScrollTrigger();
      if (cancelled || !ST) return;

      ctx = gsap.context(() => {
        const wordmark = section.querySelector<HTMLElement>(
          "[data-hero-wordmark]",
        );
        const cue = section.querySelector<HTMLElement>("[data-hero-cue]");

        // Publish the hero's full exit progress (0→1) so the R3F contour
        // scene can recede with the descent. Tracker only — no tween.
        ST.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => setHeroExitProgress(self.progress),
          onLeave: () => setHeroExitProgress(1),
          onLeaveBack: () => setHeroExitProgress(0),
        });

        // Wordmark lifts and eases back as the stage leaves — the signature
        // departs through motion instead of merely clipping at the edge.
        if (wordmark) {
          gsap.to(wordmark, {
            yPercent: -20,
            scale: 0.97,
            opacity: 0,
            filter: "blur(7px)",
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "82% top",
              scrub: true,
            },
          });
        }

        // Cue retires quickly once the descent begins — it has done its job.
        if (cue) {
          gsap.to(cue, {
            yPercent: 60,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "16% top",
              scrub: true,
            },
          });
        }
      }, section);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
      setHeroExitProgress(0);
    };
  }, [reduce]);

  return <span ref={anchorRef} aria-hidden="true" className="hidden" />;
}
