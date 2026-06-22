// Pure px ↔ rem conversion shared by the px-rem tool. No React, no DOM —
// unit-tested in tests/unit/tools/px-rem.test.ts.
//
// Both directions guard a zero (or non-finite) base: a 0 base would divide to
// Infinity/NaN and leak into the UI, so we fall back to the CSS default root
// of 16px. Callers can pass raw, half-typed numbers and always get a finite
// result back.

/** The CSS default root font size, used when the supplied base is unusable. */
export const DEFAULT_BASE = 16;

/** Normalize an arbitrary base into a usable, positive root font size. */
export function safeBase(base: number): number {
  return Number.isFinite(base) && base > 0 ? base : DEFAULT_BASE;
}

/** Convert pixels to rem against a root font size (base-0/NaN safe). */
export function pxToRem(px: number, base: number): number {
  if (!Number.isFinite(px)) return 0;
  return px / safeBase(base);
}

/** Convert rem to pixels against a root font size (base-0/NaN safe). */
export function remToPx(rem: number, base: number): number {
  if (!Number.isFinite(rem)) return 0;
  return rem * safeBase(base);
}
