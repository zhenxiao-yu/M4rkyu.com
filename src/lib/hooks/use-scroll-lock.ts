"use client";

import { useEffect } from "react";

/**
 * Locks page scroll while `locked` is true, so an open popover/dropdown
 * captures wheel + touch scrolling instead of letting it drift the page
 * underneath. Pairs with `overscroll-contain` on the popover's own
 * scroll region: the panel scrolls internally, the page stays put.
 *
 * Two mechanisms, because this site drives scroll with Lenis:
 *   1. `overflow: hidden` on <html> — locks native scroll (the
 *      reduced-motion path, where Lenis never mounts). Relies on the
 *      global `scrollbar-gutter: stable` (globals.css) so the gutter
 *      stays reserved and the layout doesn't shift.
 *   2. `data-scroll-locked` on <body> — the signal both Lenis
 *      controllers (`smooth-scroll`, `home-smooth-scroll`) watch to
 *      `lenis.stop()`. CSS `overflow` can't stop Lenis, which scrolls
 *      via JS, so this attribute is what actually freezes the page when
 *      smooth scroll is active.
 *
 * Ref-counted so multiple simultaneously-open surfaces don't fight over
 * restoring state — the lock lifts only when the last one closes.
 */
let lockCount = 0;

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    if (lockCount === 0) {
      root.style.overflow = "hidden";
      document.body.setAttribute("data-scroll-locked", "");
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        root.style.overflow = "";
        document.body.removeAttribute("data-scroll-locked");
      }
    };
  }, [locked]);
}
