// Shared hero-exit scroll progress: 0 while the hero is pinned at rest,
// rising to 1 as the stage scrolls fully past the top of the viewport.
//
// Written by `hero-scroll-choreography.tsx` (a GSAP ScrollTrigger reading
// the Lenis-smoothed scroll position) and read by the R3F contour scene
// (`hero-scene.tsx`) so the 3-D field recedes in lockstep with the
// wordmark exit instead of freezing and clipping. A plain module global —
// no React state, no re-renders — because the consumer samples it inside a
// `useFrame` loop, exactly like the Lenis instance handoff in
// `home-spine.ts`.

const state = { progress: 0 };

/** Called by the hero choreography on every scroll update (clamped 0–1). */
export function setHeroExitProgress(value: number) {
  state.progress = value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Sampled by the contour scene each frame. Returns 0 when no hero is mounted. */
export function getHeroExitProgress() {
  return state.progress;
}
