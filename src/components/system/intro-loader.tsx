"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { gsap } from "@/lib/gsap";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { BootField } from "./boot-field";
import { markBootDone } from "@/lib/system/boot-signal";
import { runBootPreload } from "@/lib/system/boot-preload";

// Module-scoped guard. The dynamically imported module instance persists
// across client-side navigations, so the boot plays once per real document
// load (and on hard refresh) but not when returning to "/" within a visit.
let bootPlayedThisDocument = false;

// Weighted boot ramp: deliberate plateaus so the counter reads like a real
// system POST rather than a smooth fill. Both axes are 0..1.
const RAMP_STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.18, 0.22],
  [0.27, 0.24],
  [0.5, 0.55],
  [0.59, 0.57],
  [0.79, 0.86],
  [0.87, 0.88],
  [1, 1],
];

function sampleProgress(t: number): number {
  for (let i = 1; i < RAMP_STOPS.length; i++) {
    const [t1, p1] = RAMP_STOPS[i];
    if (t <= t1) {
      const [t0, p0] = RAMP_STOPS[i - 1];
      const span = t1 - t0 || 1;
      const k = (t - t0) / span;
      const eased = k * k * (3 - 2 * k); // smoothstep — glides into plateaus
      return p0 + (p1 - p0) * eased;
    }
  }
  return 1;
}

/**
 * Full-viewport CRT power-on, played on every fresh load of the home route,
 * that hands off INTO the page rather than vanishing: the giant M4RKYU
 * wordmark FLIP-flies into the header monogram while the curtain peels away
 * and the hero springs to life underneath (it waits on the boot signal).
 *
 * Phases: power-on → weighted 000→100 ramp (with micro-stalls) + streaming
 * boot-log → lock → handoff. Background asset preloading runs under cover the
 * whole time (`runBootPreload`) so the page feels instant once revealed.
 *
 * Token-driven (glow/chromatic split from --ring/-2/-3 — adapts across
 * palettes), reduced-motion fully bypasses it, and any key/tap skips to the
 * handoff. The counterpart to the phosphor fault console (`global-error.tsx`).
 */
export function IntroLoader() {
  const t = useTranslations("Boot");
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "boot" | "handoff">("idle");
  const [count, setCount] = useState(0);

  const curtainRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);
  const flyRef = useRef<HTMLDivElement | null>(null);

  // Decide ONCE per document whether to play. Separate from the ramp effect
  // so StrictMode's dev double-invoke can't wedge it open.
  useEffect(() => {
    if (bootPlayedThisDocument) {
      markBootDone();
      return;
    }
    bootPlayedThisDocument = true;
    if (navigator.webdriver) {
      markBootDone();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markBootDone();
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("boot");
    // Warm fonts / images / next-route chunks under cover of the boot.
    runBootPreload((href) => router.prefetch(href));
  }, [router]);

  // Hide the SSR boot cover (#boot-cover) pre-paint by flagging <html>: once
  // the overlay is up on the play path, or immediately when the boot won't
  // play this mount (reduced motion, or already booted this document — e.g. a
  // returning SPA visit, where the flag also persists on <html> so the
  // re-rendered cover is hidden from its first paint). Holding the cover until
  // the overlay paints is what makes the load seamless — no page flash.
  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (phase !== "idle" || bootPlayedThisDocument || reduced) {
      document.documentElement.setAttribute("data-booted", "");
    }
  }, [phase]);

  // Weighted ramp + dismissal while booting.
  useEffect(() => {
    if (phase !== "boot") return;

    const start = performance.now();
    const RAMP = 3300; // counter climb
    const HOLD = 360; // dwell at 100 before the handoff
    let done = false;
    let progressTimer = 0;
    let holdTimer = 0;
    let failsafe = 0;

    const toHandoff = () => {
      if (done) return;
      done = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", toHandoff);
      window.removeEventListener("pointerdown", toHandoff);
      setCount(100);
      setPhase("handoff");
    };

    progressTimer = window.setInterval(() => {
      const tNorm = Math.min(1, (performance.now() - start) / RAMP);
      setCount(Math.round(sampleProgress(tNorm) * 100));
      if (tNorm >= 1 && !done) {
        window.clearInterval(progressTimer);
        holdTimer = window.setTimeout(toHandoff, HOLD);
      }
    }, 40);
    failsafe = window.setTimeout(toHandoff, RAMP + HOLD + 900);

    window.addEventListener("keydown", toHandoff);
    window.addEventListener("pointerdown", toHandoff);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(holdTimer);
      window.clearTimeout(failsafe);
      window.removeEventListener("keydown", toHandoff);
      window.removeEventListener("pointerdown", toHandoff);
    };
  }, [phase]);

  // Handoff: FLIP the wordmark into the header monogram while the curtain
  // peels up to reveal the (now-animating) hero.
  useEffect(() => {
    if (phase !== "handoff") return;

    // Let the hero + chrome come alive now, beneath the lifting curtain.
    markBootDone();

    const unmount = () => setPhase("idle");
    const word = wordRef.current;
    const fly = flyRef.current;
    const curtain = curtainRef.current;
    const target = document.querySelector<HTMLElement>("[data-boot-target]");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Missing refs / target or reduced motion → just drop the overlay.
    if (!word || !fly || !curtain || !target || reduced) {
      unmount();
      return;
    }

    const from = word.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    word.style.visibility = "hidden";

    gsap.set(fly, {
      position: "fixed",
      left: from.left,
      top: from.top,
      width: from.width,
      height: from.height,
      margin: 0,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transformOrigin: "center center",
    });

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const scale = Math.max(0.16, to.height / from.height);

    // Cross-dissolve the boot (so the header + monogram stay visible while
    // the wordmark docks) rather than clipping — an upward clip would keep the
    // top, where the handoff lands, covered until the very end.
    const tl = gsap.timeline({ onComplete: unmount });
    tl.to(fly, { x: dx, y: dy, scale, duration: 0.82, ease: "power4.inOut" }, 0)
      .to(fly, { opacity: 0, duration: 0.3, ease: "power2.in" }, 0.58)
      .to(
        curtain,
        { opacity: 0, scale: 1.03, duration: 0.66, ease: "power2.inOut" },
        0.14,
      )
      .fromTo(
        target,
        { scale: 1 },
        {
          scale: 1.16,
          duration: 0.18,
          ease: "power2.out",
          yoyo: true,
          repeat: 1,
          // Drop the inline transform so the header logo's Tailwind hover
          // scale keeps working after the boot.
          clearProps: "transform",
        },
        0.66,
      );

    return () => {
      tl.kill();
    };
  }, [phase]);

  const year = String(new Date().getFullYear());
  const padded = count.toString().padStart(3, "0");
  // `feed4` ("ready.") stays last; feed5/feed6 slot in ahead of it.
  const feed = [
    t("feed1"),
    t("feed2"),
    t("feed3"),
    t("feed5"),
    t("feed6"),
    t("feed4"),
  ];

  if (phase === "idle") return null;

  return (
    <div className="fixed inset-0 z-160 overflow-hidden" aria-hidden="true">
      <div
        ref={curtainRef}
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-background"
      >
        {/* Atmosphere — inert decorative layers. */}
        <div
          className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        />
        <div
          className="noise-layer pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <BootField />
        <div
          className="archive-vignette pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="scanline-layer boot-scanlines pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
        />
        <div
          className="boot-surge pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        {/* Corner system stamps. */}
        <div className="absolute left-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/60 sm:left-8 sm:top-8">
          <DecryptedText
            text={t("stampLeft")}
            sequential
            speed={20}
            animateOn="mount"
          />
        </div>
        <div className="absolute right-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/60 sm:right-8 sm:top-8">
          <DecryptedText
            text={t("stampRight", { year })}
            sequential
            speed={22}
            animateOn="mount"
            delay={80}
          />
        </div>

        {/* Power-on stack — unfolds from a bright CRT hairline. */}
        <div className="boot-crt relative flex flex-col items-center gap-7 px-6">
          <div
            ref={wordRef}
            className="boot-wordmark glitch-text relative font-wordmark text-6xl font-extrabold tracking-tight sm:text-7xl"
            data-text="M4RKYU"
          >
            M4RKYU
          </div>

          {/* Giant counter centerpiece — tabular mono so digits stay identical
           * across locales (the :lang(zh) guard swaps the pixel face, not mono). */}
          <div className="flex items-end gap-2 font-mono leading-none">
            <span className="boot-counter text-[5.5rem] font-bold tabular-nums tracking-tight text-foreground sm:text-[8rem]">
              {padded}
            </span>
            <span className="mb-3 text-xl font-medium text-foreground/50 sm:text-2xl">
              %
            </span>
          </div>

          <div className="flex w-72 flex-col gap-3 sm:w-[28rem]">
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
              <DecryptedText
                text={t("label")}
                sequential
                speed={20}
                animateOn="mount"
              />
            </div>
            <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="boot-bar-fill absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${count}%` }}
              />
              <div
                className="boot-bar-spark absolute inset-y-0 w-1.5 rounded-full"
                style={{ left: `calc(${count}% - 3px)` }}
              />
            </div>

            {/* Streaming boot-log feed — each line decrypts in on a stagger
             * spread across the longer ramp. */}
            <ul className="mt-3 grid gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-foreground/55">
              {feed.map((line, i) => (
                <li key={line} className="flex items-center gap-2">
                  <span className="text-ring" aria-hidden="true">
                    &gt;
                  </span>
                  <DecryptedText
                    text={line}
                    sequential
                    speed={18}
                    animateOn="mount"
                    delay={200 + i * 460}
                  />
                  {i === feed.length - 1 ? (
                    <span className="boot-cursor" aria-hidden="true" />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/50">
          {t("skip")}
        </div>
      </div>

      {/* FLIP clone — sits above the curtain and flies into the header
       * monogram on handoff (the in-stack wordmark is hidden at that point). */}
      <div
        ref={flyRef}
        className="boot-wordmark font-wordmark text-6xl font-extrabold tracking-tight sm:text-7xl pointer-events-none"
        style={{ position: "fixed", left: 0, top: 0, opacity: 0 }}
        aria-hidden="true"
      >
        M4RKYU
      </div>
    </div>
  );
}
