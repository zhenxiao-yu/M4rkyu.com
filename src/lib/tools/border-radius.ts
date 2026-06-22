// Pure CSS border-radius string builder. No React, no DOM — unit-tested in
// tests/unit/tools/border-radius.test.ts. Keeps the border-radius Tool free of
// stringly-typed assembly so the live preview, CSS output, and copy value all
// derive from one deterministic source.

/** Per-corner radii, clockwise from the top-left corner. */
export interface CornerRadii {
  /** Top-left radius. */
  tl: number;
  /** Top-right radius. */
  tr: number;
  /** Bottom-right radius. */
  br: number;
  /** Bottom-left radius. */
  bl: number;
}

/** Length unit appended to every corner value. */
export type RadiusUnit = "px" | "%";

/**
 * Collapse four corner radii into the shortest valid CSS shorthand.
 *
 * - All four equal              → one value          (`12px`)
 * - tl=br and tr=bl             → two values         (`12px 24px`)
 * - tl, tr=bl, br              → three values       (`8px 16px 24px`)
 * - otherwise                   → four values        (`8px 16px 24px 32px`)
 *
 * Non-finite numbers are coerced to 0 so a stray NaN can never leak into the
 * rendered preview or copied output.
 */
export function buildBorderRadius(
  { tl, tr, br, bl }: CornerRadii,
  unit: RadiusUnit = "px",
): string {
  const v = (n: number) => `${Number.isFinite(n) ? n : 0}${unit}`;
  const a = v(tl);
  const b = v(tr);
  const c = v(br);
  const d = v(bl);

  if (a === b && a === c && a === d) return a;
  if (a === c && b === d) return `${a} ${b}`;
  if (b === d) return `${a} ${b} ${c}`;
  return `${a} ${b} ${c} ${d}`;
}

/** Full `border-radius: …;` declaration for copy/paste. */
export function buildBorderRadiusCss(
  radii: CornerRadii,
  unit: RadiusUnit = "px",
): string {
  return `border-radius: ${buildBorderRadius(radii, unit)};`;
}
