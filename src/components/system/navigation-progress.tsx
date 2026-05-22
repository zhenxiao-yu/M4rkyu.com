"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Top-of-viewport progress bar that fires when an in-app link is
// clicked and completes when the new route paints. Removes the
// "did anything happen?" silence between click and first paint
// during dev / slow networks.
//
// No external deps: a fixed 2px bar, CSS-only transition, anchored
// to `--ring` so it follows the theme. The "still climbing" state
// is a single requestAnimationFrame-driven exponential ease that
// asymptotes around 90% so the bar never pretends to be done.
//
// Touch + keyboard activation are covered: we listen on `click`
// (which fires for keyboard Enter on anchors) at the document, then
// reset whenever pathname / search-params change.

const COMPLETE_DELAY_MS = 240;

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    activeRef.current = true;
    setActive(true);
    setProgress(8);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const startedAt = performance.now();
    function tick(now: number) {
      const elapsed = (now - startedAt) / 1000;
      // Exponential ease toward 90 — slow but visible "still working".
      const next = 90 - 82 * Math.exp(-elapsed * 0.8);
      setProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const complete = useCallback(() => {
    // Self-gate so the trackedKey effect can call this unconditionally
    // without reading `active` (which would force the effect to fire on
    // every active flip and the React 19 lints to grumble).
    if (!activeRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(100);
    completeTimerRef.current = setTimeout(() => {
      activeRef.current = false;
      setActive(false);
      setProgress(0);
    }, COMPLETE_DELAY_MS);
  }, []);

  // Detect in-app navigation clicks. The crucial filter: same origin,
  // internal link, no modifier keys, no target=_blank, no download.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.dataset.skipProgress === "true") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Hash-only nav to the same page — no transition.
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  // Pathname / search-params change = the new page has been requested
  // and is mounting → complete the bar. This effect bridges a non-React
  // event (router-driven URL change) into local UI state, which is the
  // exception the immutability/set-state-in-effect rules explicitly
  // allow per React 19's `useEffect` docs.
  const trackedKey = `${pathname}?${searchParams?.toString() ?? ""}`;
  useEffect(() => {
    // Bridges router-driven URL change into local UI state. complete()
    // self-gates on activeRef, so this is a no-op when no nav started.
    complete();
  }, [trackedKey, complete]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5"
      data-active={active}
      suppressHydrationWarning
    >
      <div
        className="h-full origin-left bg-ring transition-[transform,opacity] duration-150 ease-out"
        style={{
          transform: `scaleX(${(active ? progress : 0) / 100})`,
          opacity: active ? 1 : 0,
          boxShadow: active ? "0 0 8px var(--ring)" : "none",
        }}
      />
    </div>
  );
}
