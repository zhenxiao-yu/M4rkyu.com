// Pure cubic-bezier helpers. No React, no DOM — unit-tested in
// tests/unit/tools/bezier.test.ts. Keeps the easing editor free of
// stringly-typed assembly so the curve preview, CSS output, and copy value all
// derive from one deterministic, NaN-safe source.

export interface BezierPoints {
  /** P1 x — must stay in [0, 1] (CSS cubic-bezier rejects values outside). */
  x1: number;
  /** P1 y — may overshoot [0, 1] for bounce/anticipation easings. */
  y1: number;
  /** P2 x — must stay in [0, 1]. */
  x2: number;
  /** P2 y — may overshoot [0, 1]. */
  y2: number;
}

/** Round to 3 decimals, coercing non-finite input to 0 so NaN can't leak. */
export function roundCoord(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

/**
 * Clamp a single control point into the bezier-legal range. The x axis is
 * clamped to [0, 1] because CSS cubic-bezier() is invalid otherwise; the y
 * axis is left free (only NaN/∞ → 0) so overshoot easings still work.
 */
export function clampBezierPoint(x: number, y: number): { x: number; y: number } {
  const safeX = Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  return { x: safeX, y: safeY };
}

/** Normalize all four coordinates: x clamped to [0, 1], y free, all rounded. */
export function clampBezierPoints({ x1, y1, x2, y2 }: BezierPoints): BezierPoints {
  const p1 = clampBezierPoint(x1, y1);
  const p2 = clampBezierPoint(x2, y2);
  return {
    x1: roundCoord(p1.x),
    y1: roundCoord(p1.y),
    x2: roundCoord(p2.x),
    y2: roundCoord(p2.y),
  };
}

/**
 * Build a valid `cubic-bezier(...)` value. Always normalizes first, so the
 * returned string is guaranteed legal CSS regardless of raw input.
 */
export function formatCubicBezier(points: BezierPoints): string {
  const { x1, y1, x2, y2 } = clampBezierPoints(points);
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}
