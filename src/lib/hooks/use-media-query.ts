"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe media-query subscription that returns the current match
 * state and re-renders when it flips. Uses `useSyncExternalStore` so
 * the server snapshot stays stable (`false` by default) and no
 * setState fires inside an effect — keeps the React 19 strict-mode
 * checks happy.
 *
 * Pass any standard CSS media-query string, e.g.
 *
 *   useMediaQuery("(pointer: fine)")
 *   useMediaQuery("(prefers-reduced-motion: reduce)")
 *   useMediaQuery("(min-width: 768px)")
 */
export function useMediaQuery(query: string, serverFallback = false): boolean {
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery(query, callback),
    () => readMediaQuery(query),
    () => serverFallback,
  );
}

function subscribeMediaQuery(query: string, callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const mq = window.matchMedia(query);
  // Safari < 14 fires `addListener` instead of `addEventListener`.
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  }
  mq.addListener(callback);
  return () => mq.removeListener(callback);
}

function readMediaQuery(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}
