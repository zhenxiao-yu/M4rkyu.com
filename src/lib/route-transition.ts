import { playCue } from "@/lib/audio/ui-sound";

// Ink-wipe page transition — a tiny module singleton (same shape as
// home-spine.ts / hero-scroll-progress.ts: plain module, subscribe +
// snapshot, no React state) that drives the full-screen accent-ink
// curtain over a route change.
//
// The sequence: cover the viewport → navigate behind the cover → reveal
// the new page. `TransitionLink` calls `playInkWipe(navigate)` instead of
// running the route swap directly; `InkCurtain` renders the phase via
// `useSyncExternalStore`. Reduced-motion (or a missing DOM) skips the
// curtain entirely and navigates instantly — no perceived cost.

export type InkWipePhase = "idle" | "covering" | "revealing";

export interface InkWipeState {
  phase: InkWipePhase;
  /** Cover slide duration for the active wipe (ms). */
  coverMs: number;
  /** Reveal slide duration for the active wipe (ms). */
  revealMs: number;
}

const IDLE: InkWipeState = { phase: "idle", coverMs: 260, revealMs: 380 };

let state: InkWipeState = IDLE;
let inFlight = false;
let coverTimer: ReturnType<typeof setTimeout> | null = null;
let revealTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<() => void>();

function emit(next: InkWipeState) {
  state = next;
  for (const l of listeners) l();
}

export function subscribeInkWipe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getInkWipeSnapshot(): InkWipeState {
  return state;
}

// Stable server snapshot so useSyncExternalStore doesn't loop during SSR.
export function getInkWipeServerSnapshot(): InkWipeState {
  return IDLE;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function pickDurations(): { coverMs: number; revealMs: number } {
  // Snappier on phones so the signature moment never feels like it blocks
  // a tap (mirrors the existing mobile route-transition pacing).
  const mobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 640px)").matches;
  return mobile
    ? { coverMs: 170, revealMs: 250 }
    : { coverMs: 260, revealMs: 380 };
}

/**
 * Run the ink-wipe around a navigation. `navigate` performs the actual
 * route change (e.g. `router.push(href)`); it fires once the viewport is
 * covered so the swap is never seen. Falls back to an instant navigate on
 * reduced-motion or non-DOM environments. Guards against overlapping wipes.
 */
export function playInkWipe(navigate: () => void): void {
  if (inFlight) return;

  if (prefersReducedMotion() || typeof window === "undefined") {
    navigate();
    return;
  }

  inFlight = true;
  // Soft "scene-enter" cue on the navigation gesture. `playCue` is a no-op
  // unless the user has explicitly enabled UI sound, and the reduced-motion
  // guard above already returned (so this only runs with motion allowed). The
  // click that triggered this wipe is the user gesture Web Audio needs to
  // resume a suspended context. A 3s cue cooldown keeps rapid nav from spamming.
  playCue("scene-enter");
  const { coverMs, revealMs } = pickDurations();
  emit({ phase: "covering", coverMs, revealMs });

  coverTimer = setTimeout(() => {
    navigate();
    // Let the route commit (RSC payload / loading boundary) before we
    // uncover, so the reveal never flashes the outgoing page. Two rAFs =
    // one full frame after the navigation is queued.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        emit({ phase: "revealing", coverMs, revealMs });
        revealTimer = setTimeout(() => {
          emit(IDLE);
          inFlight = false;
        }, revealMs);
      });
    });
  }, coverMs);
}

// Defensive teardown for HMR / unmount — not wired to a component lifecycle
// (the store outlives any single curtain mount), but exported in case a
// future caller needs to abort an in-flight wipe.
export function cancelInkWipe(): void {
  if (coverTimer) clearTimeout(coverTimer);
  if (revealTimer) clearTimeout(revealTimer);
  coverTimer = null;
  revealTimer = null;
  inFlight = false;
  emit(IDLE);
}
