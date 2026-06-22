// Pure fluid-typography math. No React, no DOM — unit-tested in
// tests/unit/tools/fluid-type.test.ts. Turns a min/max font size and a
// min/max viewport into a single CSS `clamp()` that scales linearly between
// the breakpoints and locks flat outside them. Keeping the math here means
// the live preview, CSS declaration, and copied value all derive from one
// deterministic source.

export interface FluidTypeInput {
  /** Smallest font size, in px, used at (or below) `minVw`. */
  minFont: number;
  /** Largest font size, in px, used at (or above) `maxVw`. */
  maxFont: number;
  /** Viewport width, in px, where the size reaches its minimum. */
  minVw: number;
  /** Viewport width, in px, where the size reaches its maximum. */
  maxVw: number;
  /** Root font size, in px, used to convert px → rem. Defaults to 16. */
  base?: number;
}

export interface FluidTypeResult {
  /** The composed `clamp(min, slope·vw + intercept, max)` string. */
  clamp: string;
  /** vw coefficient (slope · 100), in vw units. */
  vw: number;
  /** y-intercept of the linear segment, in px. */
  interceptPx: number;
  /** Linear slope (px per px of viewport). */
  slope: number;
  /**
   * True when the viewport range is usable. False when `minVw === maxVw`
   * (the slope would divide by zero), in which case the result is a flat,
   * non-scaling clamp.
   */
  ok: boolean;
}

// Trim trailing zeros from a fixed-precision number so the output reads like
// hand-written CSS (1.5rem, not 1.5000rem). Coerces non-finite input to 0 so
// a stray NaN/Infinity can never leak into the rendered output.
function trim(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return "0";
  return Number(n.toFixed(dp)).toString();
}

const finiteOr = (n: number, fallback: number): number =>
  Number.isFinite(n) ? n : fallback;

/**
 * Build a fluid-typography `clamp()` from min/max font sizes and viewports.
 *
 * The linear segment is `slope · 100vw + interceptPx`, where
 * `slope = (maxFont − minFont) / (maxVw − minVw)`.
 *
 * Divide-by-zero / NaN guard: when `minVw === maxVw` the span is 0 and the
 * slope would be ±Infinity (or NaN for 0/0). We detect that, set the slope to
 * 0, and emit a flat `clamp(min, min, max)` so the UI degrades gracefully
 * instead of rendering `Infinityvw` / `NaNrem`. `ok` is returned false so the
 * caller can surface a hint. All inputs are coerced finite first, so a
 * non-numeric field (already parsed to a fallback upstream) can never inject
 * NaN here either.
 */
export function buildFluidType({
  minFont,
  maxFont,
  minVw,
  maxVw,
  base = 16,
}: FluidTypeInput): FluidTypeResult {
  const root = base > 0 && Number.isFinite(base) ? base : 16;
  const loFont = finiteOr(minFont, 0);
  const hiFont = finiteOr(maxFont, 0);
  const loVw = finiteOr(minVw, 0);
  const hiVw = finiteOr(maxVw, 0);

  const span = hiVw - loVw;
  const ok = span !== 0;
  const slope = ok ? (hiFont - loFont) / span : 0;
  const interceptPx = loFont - slope * loVw;
  const vw = slope * 100;

  // Clamp bounds are order-independent: a designer can enter a larger "min"
  // than "max" and still get a valid clamp() rather than a broken one.
  const minRem = loFont / root;
  const maxRem = hiFont / root;
  const lo = Math.min(minRem, maxRem);
  const hi = Math.max(minRem, maxRem);
  const mid = ok
    ? `${trim(vw)}vw + ${trim(interceptPx / root)}rem`
    : `${trim(lo)}rem`;

  return {
    clamp: `clamp(${trim(lo)}rem, ${mid}, ${trim(hi)}rem)`,
    vw,
    interceptPx,
    slope,
    ok,
  };
}

/**
 * Resolve the rendered px size at a given viewport width, clamped to the
 * [min, max] font bounds. Used by the live preview so it can simulate a
 * viewport without depending on the real window size.
 */
export function resolveFluidPx(
  result: Pick<FluidTypeResult, "slope" | "interceptPx">,
  viewportPx: number,
  minFont: number,
  maxFont: number,
): number {
  const raw = result.slope * finiteOr(viewportPx, 0) + result.interceptPx;
  const lo = Math.min(minFont, maxFont);
  const hi = Math.max(minFont, maxFont);
  return Math.round(Math.min(Math.max(finiteOr(raw, lo), lo), hi));
}
