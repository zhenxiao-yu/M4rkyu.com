"use client";

import { useSyncExternalStore } from "react";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";

export type ToolViewMode = "grid" | "list";

const DEFAULT_MODE: ToolViewMode = "grid";

// Default channel for the /resources/tools page. Other surfaces
// (e.g. /resources/links) pass an override into `useToolViewMode`
// to keep their preference independent.
const DEFAULT_STORAGE_KEY = "m4rkyu:resources:view-mode";
const DEFAULT_STORAGE_EVENT = "m4rkyu:resources-view-mode-changed";

interface UseToolViewModeOptions {
  /** localStorage key; defaults to the tools-page channel. */
  storageKey?: string;
  /** Synthetic event name used for cross-instance sync within a tab. */
  storageEvent?: string;
}

// Persisted grid/list preference for /resources surfaces. Mirrors
// useViewMode for /logs — SSR renders the default grid, hydration
// swaps to the stored value, setter broadcasts a synthetic event so
// any other instance in the same tab re-snapshots.
export function useToolViewMode(options: UseToolViewModeOptions = {}) {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const storageEvent = options.storageEvent ?? DEFAULT_STORAGE_EVENT;

  function subscribe(callback: () => void) {
    return subscribeStoredValue(storageKey, storageEvent, callback);
  }

  function getSnapshot(): ToolViewMode {
    const stored = readStoredString(storageKey);
    if (stored === "list" || stored === "grid") return stored;
    return DEFAULT_MODE;
  }

  function getServerSnapshot(): ToolViewMode {
    return DEFAULT_MODE;
  }

  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setMode(next: ToolViewMode) {
    writeStoredString(storageKey, next);
    dispatchStoredValueChanged(storageEvent);
  }

  return [mode, setMode] as const;
}
