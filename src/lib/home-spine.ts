// Programmatic next / previous navigation across the home story spine.
//
// The page itself scrolls continuously. This helper is only for explicit
// affordances such as the hero scroll cue: when the home provider has
// registered Lenis we route through it, otherwise we fall back to native
// `scrollIntoView`.

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

const SECTION_SELECTOR = "[data-home-section]";

function reduceMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// The sticky glass dock reserves `--dock-h` at the top of the viewport. Paging
// computes a raw numeric scroll position, which `scroll-margin-top` (used by
// the anchor/scrollIntoView path) does NOT apply to — so without this offset
// the cue parks each section flush under the dock, clipping its eyebrow.
function dockOffset() {
  const v = getComputedStyle(document.documentElement).getPropertyValue(
    "--dock-h",
  );
  return parseInt(v, 10) || 56;
}

function scrollToHomeTarget(target: HTMLElement | number, duration = 0.7) {
  if (typeof window === "undefined") return;
  const reduce = reduceMotion();
  if (lenis) {
    lenis.scrollTo(target, {
      offset: -dockOffset(),
      immediate: reduce,
      duration: reduce ? 0 : duration,
    });
  } else if (typeof target === "number") {
    window.scrollTo({
      top: target - dockOffset(),
      behavior: reduce ? "auto" : "smooth",
    });
  } else {
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }
}

/** Index of the home section currently closest to the viewport top. */
function currentIndex(sections: HTMLElement[]) {
  const y = window.scrollY;
  const tolerance = Math.max(24, window.innerHeight * 0.18);
  let index = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const top = sections[i]!.getBoundingClientRect().top + y;
    if (top <= y + tolerance) index = i;
    else break;
  }
  return index;
}

/**
 * Jump to the adjacent home section. `direction` is +1 (next) or -1
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
  const target = Math.min(
    sections.length - 1,
    Math.max(0, current + direction),
  );
  if (target === current) return;

  const el = sections[target]!;
  scrollToHomeTarget(el.getBoundingClientRect().top + window.scrollY);
}
