"use client";

import { useSyncExternalStore } from "react";
import {
  isSoundEnabled,
  subscribeSoundEnabled,
} from "@/lib/audio/ui-sound";

/**
 * Returns the current UI-sound preference, kept in sync with localStorage.
 *
 * Server snapshot is `false` (the spec's default-OFF state), so SSR markup
 * always matches the first client paint; subscribe re-runs after hydration
 * and triggers a re-render only if the persisted value differs.
 */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribeSoundEnabled,
    () => isSoundEnabled(),
    () => false,
  );
}
