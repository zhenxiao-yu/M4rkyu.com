"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const SESSION_KEY = "m4rkyu:intro-played";

/**
 * One-shot full-viewport intro shown on the first visit of a session.
 * Skips entirely on repeat visits (sessionStorage flag) and on
 * `prefers-reduced-motion: reduce`. Renders nothing on the server so
 * SSR HTML stays untouched and there is no hydration delta.
 *
 * The intent is perceived-performance: the homepage's first paint runs
 * behind the overlay while the visitor watches a deterministic counter,
 * so subsequent scroll/interaction feels immediate.
 */
export function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    // Reading sessionStorage and matchMedia at module level would
    // diverge from SSR; the intro is a deliberate post-hydration
    // one-shot. The setState here cannot be lifted out of the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");

    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setVisible(false), 220);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-cyber-grid opacity-30"
            aria-hidden="true"
          />
          <div
            className="archive-vignette absolute inset-0"
            aria-hidden="true"
          />
          <div className="relative flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              className="font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight sm:text-6xl"
            >
              M4RKYU
            </motion.div>
            <div className="flex w-72 flex-col gap-2 sm:w-96">
              <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                <span>booting · m4rkyu.com</span>
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
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
