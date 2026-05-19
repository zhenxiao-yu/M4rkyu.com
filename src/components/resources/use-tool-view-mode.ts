"use client";

import { useSyncExternalStore } from "react";
import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";

export type ToolViewMode = "grid" | "list";

const STORAGE_KEY = "m4rkyu:resources:view-mode";
const DEFAULT_MODE: ToolViewMode = "grid";
const STORAGE_EVENT = "m4rkyu:resources-view-mode-changed";

function subscribe(callback: () => void) {
  return subscribeStoredValue(STORAGE_KEY, STORAGE_EVENT, callback);
}

function getSnapshot(): ToolViewMode {
  const stored = readStoredString(STORAGE_KEY);
  if (stored === "list" || stored === "grid") return stored;
  return DEFAULT_MODE;
}

function getServerSnapshot(): ToolViewMode {
  return DEFAULT_MODE;
}

// Persisted grid/list preference for /resources. Mirrors useViewMode
// for /logs — SSR renders the default grid, hydration swaps to the
// stored value, setter broadcasts a synthetic event so any other
// instance in the same tab re-snapshots.
export function useToolViewMode() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function setMode(next: ToolViewMode) {
    writeStoredString(STORAGE_KEY, next);
    dispatchStoredValueChanged(STORAGE_EVENT);
  }

  return [mode, setMode] as const;
}
