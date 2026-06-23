// Background asset warm-up fired under cover of the home boot sequence.
// Everything here is best-effort and must never throw — the boot's timing
// does not depend on any of it; the payoff is that the hero + first scroll
// feel instant the moment the curtain lifts.

type Prefetch = (href: string) => void;

// Most likely first hops off the home page.
const PREFETCH_ROUTES = ["/work", "/about", "/games"] as const;

export function runBootPreload(prefetch?: Prefetch): void {
  if (typeof window === "undefined") return;

  // Resolve web fonts so the hero paints with its final type (no swap
  // flashing behind the overlay).
  try {
    if (document.fonts?.ready) document.fonts.ready.catch(() => {});
  } catch {
    /* no-op */
  }

  // Warm the smooth-scroll chunk. HomeSmoothScroll also imports it on mount;
  // pulling it here under cover removes any first-wheel hitch. Idempotent —
  // the module cache dedupes.
  void import("lenis").catch(() => {});

  // Prefetch the most likely next routes while the screen is covered.
  if (prefetch) {
    for (const href of PREFETCH_ROUTES) {
      try {
        prefetch(href);
      } catch {
        /* no-op */
      }
    }
  }

  // Decode above-the-fold images so the first scroll is paint-ready. Done at
  // idle so it never competes with the boot animation's frames.
  const decodeImages = () => {
    try {
      for (const img of Array.from(document.images).slice(0, 8)) {
        img.decode?.().catch(() => {});
      }
    } catch {
      /* no-op */
    }
  };
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void) => void;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(decodeImages);
  else window.setTimeout(decodeImages, 450);
}
