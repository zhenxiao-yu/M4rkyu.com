"use client";

import { useSyncExternalStore } from "react";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";

export type BlogViewMode = "list" | "grid";

const STORAGE_KEY = "m4rkyu:logs:view-mode";
const DEFAULT_MODE: BlogViewMode = "list";
const STORAGE_EVENT = "m4rkyu:view-mode-changed";

function subscribe(callback: () => void) {
  return subscribeStoredValue(STORAGE_KEY, STORAGE_EVENT, callback);
}

function getSnapshot(): BlogViewMode {
  const stored = readStoredString(STORAGE_KEY);
  if (stored === "list" || stored === "grid") return stored;
  return DEFAULT_MODE;
}

function getServerSnapshot(): BlogViewMode {
  return DEFAULT_MODE;
}

/**
 * Persisted view-mode preference for `/logs`. SSR renders the default
 * (`list`); on hydration `useSyncExternalStore` swaps to the value
 * read from localStorage. Setter writes to storage and broadcasts a
 * synthetic event so other consumers in the same tab re-snapshot.
 */
export function useViewMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setMode(next: BlogViewMode) {
    writeStoredString(STORAGE_KEY, next);
    dispatchStoredValueChanged(STORAGE_EVENT);
  }

  return [mode, setMode] as const;
}
