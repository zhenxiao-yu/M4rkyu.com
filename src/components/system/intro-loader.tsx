"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import {
  readStoredString,
  writeStoredString,
} from "@/lib/browser/safe-storage";

// Bump the suffix when the boot scene is reworked so existing visitors
// see the new version once before the session-storage gate caches it
// off for the rest of their tab session.
const SESSION_KEY = "m4rkyu:intro-played-v3";

/**
 * Optional full-viewport boot overlay shown only when the URL includes
 * `?intro=1`. It stays out of the default path so first-load header
 * controls are never visually covered after the user has already tried
 * to interact with the page.
 *
 * v3 polish (ReactBits text-animation pass):
 *   - Wordmark "M4RKYU" decrypts in via DecryptedText sequential mode.
 *   - Four status lines scramble in, each delayed so the sequence
 *     reads as a system boot feed.
 *   - Progress bar still pulses, deterministic 1.8 s.
 *   - Cyber-grid + scanlines + bottom version stamp for atmospheric depth.
 *
 * The intent is perceived-performance: the homepage's first paint runs
 * behind the overlay while the visitor watches the boot, so scrolling
 * feels instant afterward.
 */
export function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const shouldPlay =
      new URLSearchParams(window.location.search).get("intro") === "1";
    if (!shouldPlay) return;
    if (readStoredString(SESSION_KEY, "", "session") === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      writeStoredString(SESSION_KEY, "1", "session");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);

    const start = performance.now();
    const duration = 950;
    let done = false;
    let progressTimer = 0;
    let exitTimer = 0;
    let failsafeTimer = 0;

    const finish = () => {
      if (done) return;
      done = true;
      window.clearInterval(progressTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(failsafeTimer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
      writeStoredString(SESSION_KEY, "1", "session");
      setCount(100);
      setVisible(false);
    };

    // Use an interval plus a failsafe timer so the home page is never
    // held hostage by a throttled or paused requestAnimationFrame loop.
    progressTimer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t >= 1 && !done) {
        window.clearInterval(progressTimer);
        exitTimer = window.setTimeout(finish, 120);
      }
    }, 40);
    failsafeTimer = window.setTimeout(finish, duration + 600);

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(failsafeTimer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden bg-background"
          aria-hidden="true"
        >
          <div
            className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          />
          <div
            className="archive-vignette pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div
            className="scanline-layer pointer-events-none absolute inset-0 opacity-30"
            aria-hidden="true"
          />

          {/* Corner version stamps for that "system" feel */}
          <div className="absolute left-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/60 sm:left-8 sm:top-8">
            <DecryptedText
              text="M4RKYU.SYS · BOOT v2027"
              sequential
              speed={20}
              animateOn="mount"
            />
          </div>
          <div className="absolute right-4 top-4 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/60 sm:right-8 sm:top-8">
            <DecryptedText
              text={`SESSION · ${new Date().getFullYear()}`}
              sequential
              speed={22}
              animateOn="mount"
              delay={80}
            />
          </div>

          <div className="relative flex flex-col items-center gap-10 px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className="font-display text-6xl font-extrabold tracking-tight sm:text-7xl"
            >
              <DecryptedText
                text="M4RKYU"
                sequential
                speed={40}
                revealDirection="center"
                animateOn="mount"
                encryptedClassName="text-foreground/40"
              />
            </motion.div>

            <div className="flex w-72 flex-col gap-3 sm:w-[28rem]">
              <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                <DecryptedText
                  text="booting · m4rkyu.com"
                  sequential
                  speed={20}
                  animateOn="mount"
                />
                <span className="tabular-nums text-foreground">
                  {count.toString().padStart(3, "0")}
                </span>
              </div>
              <div className="relative h-0.5 w-full overflow-hidden bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-ring"
                  style={{ width: `${count}%` }}
                  transition={{ duration: 0 }}
                />
              </div>

              {/* Status feed — each line decrypts in with staggered delay so
               * the sequence reads as the boot streaming output. */}
              <ul className="mt-3 grid gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-foreground/55">
                {[
                  "calibrating archive...",
                  "loading creative + developer...",
                  "ontario · canada — built deliberately",
                  "ready.",
                ].map((line, i) => (
                  <li key={line}>
                    <DecryptedText
                      text={line}
                      sequential
                      speed={18}
                      animateOn="mount"
                      delay={180 + i * 240}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground/50">
            tap or press any key to skip
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
