// Tiny cross-component signal for the home boot sequence. The IntroLoader
// marks the boot done at handoff (or immediately when it decides not to
// play); the hero waits on it so its reveal fires exactly as the curtain
// lifts. Module-scoped, so it survives client-side navigations (a returning
// SPA visit sees `done` already true → reveal is instant) and resets on a
// real document load.

const EVENT = "m4rkyu:boot-done";

let done = false;

/** Signal that the boot has handed off (idempotent). */
export function markBootDone(): void {
  if (done) return;
  done = true;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

/** Whether the boot has already handed off this document. */
export function isBootDone(): boolean {
  return done;
}

/**
 * Run `cb` once the boot hands off. Fires synchronously if it already has.
 * Returns an unsubscribe function.
 */
export function onBootDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
