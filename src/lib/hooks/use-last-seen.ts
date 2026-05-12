"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * `useSyncExternalStore`-backed timestamp persisted to `localStorage`.
 *
 * Pattern: "when did the user last see X" — used by the notification
 * bell, but generic. Pass any storage key and you get back the
 * timestamp plus a stable `markSeen` callback that writes `Date.now()`
 * and broadcasts to subscribers in this tab (same-tab `storage` events
 * don't fire natively) and other tabs (native `storage` events).
 *
 * SSR-safe: on the server, `getServerSnapshot` returns
 * `Number.POSITIVE_INFINITY` so any "is this item newer than lastSeen"
 * check evaluates `false` and no UI badge flashes on first paint for
 * returning visitors. The real value lands on the next render after
 * hydration via `useSyncExternalStore` semantics.
 */
export function useLastSeen(storageKey: string): {
  lastSeen: number;
  markSeen: () => void;
} {
  const lastSeen = useSyncExternalStore(
    (cb) => subscribe(storageKey, cb),
    () => readTimestamp(storageKey),
    serverSnapshot,
  );

  const markSeen = useCallback(() => {
    const now = Date.now();
    try {
      window.localStorage.setItem(storageKey, String(now));
      // Same-tab writes don't fire `storage`; broadcast via a custom
      // event scoped to this key so other subscribers re-compute.
      window.dispatchEvent(new CustomEvent(eventNameFor(storageKey)));
    } catch {
      /* localStorage unavailable (private mode, quota, …) — silent. */
    }
  }, [storageKey]);

  return { lastSeen, markSeen };
}

function eventNameFor(storageKey: string): string {
  return `__lastSeen:${storageKey}`;
}

function subscribe(storageKey: string, callback: () => void): () => void {
  const customEvent = eventNameFor(storageKey);
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey) callback();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(customEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(customEvent, callback);
  };
}

function readTimestamp(storageKey: string): number {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function serverSnapshot(): number {
  return Number.POSITIVE_INFINITY;
}
