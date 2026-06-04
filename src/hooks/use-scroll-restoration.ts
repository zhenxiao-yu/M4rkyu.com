"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-position restoration for back/forward navigation.
 *
 * The site runs Lenis smooth-scroll (see `src/providers/smooth-scroll.tsx`),
 * which animates `window.scrollY` itself. That fights the browser's native
 * scroll restoration, so pressing Back on a deep page dumps the user at the
 * top. This module flips `history.scrollRestoration` to `"manual"` and takes
 * over restoration explicitly.
 *
 * Keying. Browser history entries don't carry a stable, readable id across a
 * back/forward in App Router, so we stamp our own. On first sight of a history
 * entry we mint a key and write it back with `history.replaceState` (preserving
 * Next's existing state object). The key rides along with that entry for the
 * life of the tab, so a POP back to it reads the same key — and thus the saved
 * position. Positions live in `sessionStorage` (survives back/forward, clears
 * on tab close).
 *
 * POP vs PUSH. A `popstate` event is the reliable back/forward signal. On POP
 * we restore the saved position for the entry we landed on. A forward
 * navigation to a brand-new entry never has a saved position, so it falls
 * through to "top" — which is the desired behaviour.
 *
 * Lenis. The provider registers/unregisters its live instance via
 * `registerLenis`. When Lenis is active we restore with
 * `lenis.scrollTo(y, { immediate: true })` so the smooth loop adopts the
 * position instead of overwriting it on the next frame; otherwise we use
 * `window.scrollTo`. Restoration is always immediate — no animated jump.
 */

interface LenisLike {
  scrollTo: (
    target: number,
    options?: { immediate?: boolean; force?: boolean },
  ) => void;
  scroll: number;
}

const STORAGE_PREFIX = "m4-scroll:";
const HISTORY_KEY_FIELD = "__m4ScrollKey";

// Module-level handle to the active site-wide Lenis instance. `null` when Lenis
// isn't mounted (reduced-motion, home route, or before the dynamic import
// resolves), in which case we fall back to native scroll.
let activeLenis: LenisLike | null = null;

/** Provider hook: publish/withdraw the live Lenis instance. */
export function registerLenis(instance: LenisLike | null): void {
  activeLenis = instance;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Stable id for the current history entry. Reads our stamped key from
 * `history.state`; mints + persists one (via `replaceState`, preserving the
 * existing state) the first time an entry is seen. Falls back to the URL when
 * history state is unavailable.
 */
function getHistoryKey(): string {
  if (!isBrowser()) return "ssr";
  try {
    const state = window.history.state as Record<string, unknown> | null;
    const existing = state?.[HISTORY_KEY_FIELD];
    if (typeof existing === "string") return existing;

    const minted =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const nextState = { ...(state ?? {}), [HISTORY_KEY_FIELD]: minted };
    window.history.replaceState(nextState, "");
    return minted;
  } catch {
    // Private-mode / locked-down history: fall back to the URL. Less precise
    // (collides if the same URL sits at two depths in the stack) but safe.
    return `url:${window.location.pathname}${window.location.search}`;
  }
}

function readPosition(key: string): number | null {
  if (!isBrowser()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return null;
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function writePosition(key: string, y: number): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.round(y)));
  } catch {
    // Quota / disabled storage: drop silently. Restoration just no-ops.
  }
}

/** Current scroll offset, preferring Lenis' animated value when active. */
function currentScrollY(): number {
  if (activeLenis) return activeLenis.scroll;
  if (!isBrowser()) return 0;
  return window.scrollY;
}

function applyScroll(y: number): void {
  if (!isBrowser()) return;
  if (activeLenis) {
    activeLenis.scrollTo(y, { immediate: true, force: true });
    return;
  }
  window.scrollTo(0, y);
}

/**
 * Restore the saved position for the given key. Layout may not be final on the
 * first frame after a navigation (images, fonts, MDX hydrating), so we re-apply
 * across a couple of animation frames. Cheap and bounded — no timers.
 */
function restoreForKey(key: string): void {
  const saved = readPosition(key);
  if (saved === null) return;

  applyScroll(saved);
  requestAnimationFrame(() => {
    applyScroll(saved);
    requestAnimationFrame(() => applyScroll(saved));
  });
}

/**
 * Install scroll-restoration listeners. Pass a navigation signal (the current
 * pathname is ideal) so client-side PUSH navigations — which do not fire
 * `popstate` — re-key and re-evaluate restoration too. A fresh PUSH entry has
 * no saved position and therefore stays at the top, which is what we want.
 */
export function useScrollRestoration(navSignal?: string): void {
  // Key of the history entry we're currently parked on. Shared between the
  // listener effect (saves) and the nav-signal effect (re-keys on PUSH).
  const keyRef = useRef<string>("ssr");

  // Listener install — once. Saves on scroll/pagehide under the *current* key.
  useEffect(() => {
    if (!isBrowser()) return;

    const previousRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // Some embedded webviews disallow this; restoration still works, the
      // browser may just also nudge the position.
    }

    // Ensure the entry we mounted on has a key, then restore if we already
    // have a saved position for it (e.g. refresh, or forward back into it).
    keyRef.current = getHistoryKey();
    restoreForKey(keyRef.current);

    let saveScheduled = false;
    const save = () => {
      saveScheduled = false;
      writePosition(keyRef.current, currentScrollY());
    };
    const scheduleSave = () => {
      if (saveScheduled) return;
      saveScheduled = true;
      requestAnimationFrame(save);
    };

    const onScroll = () => scheduleSave();
    const onPageHide = () => save();

    // Back/forward: the entry we land on already carries its key, so reading it
    // back yields the position we stored when we left it. (Where we left *from*
    // was already persisted by the scroll listener.)
    const onPopState = () => {
      keyRef.current = getHistoryKey();
      restoreForKey(keyRef.current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("popstate", onPopState);

    return () => {
      save();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("popstate", onPopState);
      try {
        window.history.scrollRestoration = previousRestoration;
      } catch {
        // ignore
      }
    };
  }, []);

  // Client-side PUSH/replace navigations don't fire `popstate`. When the route
  // changes, adopt the new entry's key and restore. A fresh PUSH entry has no
  // saved position, so this lands at the top; a programmatic back that also
  // changed the pathname is idempotent with the popstate handler.
  useEffect(() => {
    if (!isBrowser()) return;
    // Skip the initial run — the install effect already keyed + restored it.
    if (keyRef.current === getHistoryKey()) return;
    keyRef.current = getHistoryKey();
    restoreForKey(keyRef.current);
  }, [navSignal]);
}
