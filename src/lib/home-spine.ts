// Programmatic next / previous navigation across the home snap spine.
//
// The home is a stack of `[data-snap="section"]` slides. On desktop the
// `HomeSmoothScroll` provider drives them with Lenis (smooth wheel +
// proximity snap); on touch / reduced-motion there is no Lenis and the
// browser handles native CSS scroll-snap. This helper bridges both: when
// the provider has registered its Lenis instance we use `lenis.scrollTo`
// (so the jump stays inside Lenis' loop instead of fighting it);
// otherwise we fall back to native `scrollIntoView`.

type SpineLenis = {
  scrollTo: (
    target: HTMLElement | number | string,
    options?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

let lenis: SpineLenis | null = null;

/** Called by HomeSmoothScroll once Lenis exists (and with null on teardown). */
export function registerSpineLenis(instance: SpineLenis | null) {
  lenis = instance;
}

const SECTION_SELECTOR = "[data-snap='section']";

/** Index of the snap section the viewport is currently anchored to. */
function currentIndex(sections: HTMLElement[]) {
  const y = window.scrollY;
  let index = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const top = sections[i]!.getBoundingClientRect().top + y;
    // 4px tolerance absorbs sub-pixel rounding at a snapped boundary.
    if (top <= y + 4) index = i;
    else break;
  }
  return index;
}

/**
 * Jump to the adjacent snap section. `direction` is +1 (next) or -1
 * (previous); clamps at the ends (no wrap). Honors reduced-motion by
 * jumping instantly. Safe to call before Lenis mounts.
 */
export function scrollSpine(direction: 1 | -1) {
  if (typeof document === "undefined") return;
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>(SECTION_SELECTOR),
  );
  if (sections.length === 0) return;

  const current = currentIndex(sections);
  const target = Math.min(sections.length - 1, Math.max(0, current + direction));
  if (target === current) return;

  const el = sections[target]!;
  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (lenis) {
    lenis.scrollTo(el, { offset: 0, immediate: reduce, duration: reduce ? 0 : 0.7 });
  } else {
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}
