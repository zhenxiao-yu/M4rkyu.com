// Pure CSS box-model string + geometry helpers. No React, no DOM —
// unit-tested in tests/unit/tools/box-model.test.ts. Keeps the box-model Tool
// free of stringly-typed assembly so the live preview, CSS output, and copy
// value all derive from one deterministic source. Every numeric field is
// coerced through Number so a stray NaN can never leak into the rendered
// preview or the copied CSS.

export interface BoxModel {
  /** Content width in px. */
  width: number;
  /** Content height in px. */
  height: number;
  /** Padding (all sides) in px (>= 0). */
  padding: number;
  /** Border width (all sides) in px (>= 0). */
  border: number;
  /** Margin (all sides) in px. */
  margin: number;
}

function safe(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/** Build the declaration block (no selector), one declaration per line. */
export function buildBoxModelCss({
  width,
  height,
  padding,
  border,
  margin,
}: BoxModel): string {
  return [
    `width: ${safe(width)}px;`,
    `height: ${safe(height)}px;`,
    `padding: ${safe(padding)}px;`,
    `border: ${safe(border)}px solid;`,
    `margin: ${safe(margin)}px;`,
  ].join("\n");
}

/**
 * Outer dimensions under the default `content-box` model — content plus
 * padding, border, and margin on both sides.
 */
export function outerSize({
  width,
  height,
  padding,
  border,
  margin,
}: BoxModel): { width: number; height: number } {
  const surround = (safe(padding) + safe(border) + safe(margin)) * 2;
  return {
    width: safe(width) + surround,
    height: safe(height) + surround,
  };
}
