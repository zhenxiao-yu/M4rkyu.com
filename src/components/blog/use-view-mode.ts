"use client";

import { useSyncExternalStore } from "react";

export type BlogViewMode = "list" | "grid";

const STORAGE_KEY = "m4rkyu:logs:view-mode";
const DEFAULT_MODE: BlogViewMode = "grid";
const STORAGE_EVENT = "m4rkyu:view-mode-changed";

function subscribe(callback: () => void) {
  // `storage` covers cross-tab updates (the browser fires it for
  // other tabs only). Our same-tab setter dispatches a synthetic
  // event so subscribers in this tab also pick up changes.
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getSnapshot(): BlogViewMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "list" || stored === "grid") return stored;
  } catch {
    /* localStorage blocked — fall through to default */
  }
  return DEFAULT_MODE;
}

function getServerSnapshot(): BlogViewMode {
  return DEFAULT_MODE;
}

/**
 * Persisted view-mode preference for `/logs`. SSR renders the default
 * (`grid`); on hydration `useSyncExternalStore` swaps to the value
 * read from localStorage. Setter writes to storage and broadcasts a
 * synthetic event so other consumers in the same tab re-snapshot.
 */
export function useViewMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setMode(next: BlogViewMode) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  return [mode, setMode] as const;
}
