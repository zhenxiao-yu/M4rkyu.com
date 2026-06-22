// Pure CSS box-shadow string builder. No React, no DOM — unit-tested in
// tests/unit/tools/shadow.test.ts. Keeps the shadow-generator Tool free of
// stringly-typed assembly so the live preview, CSS output, and copy value all
// derive from one deterministic source.

export interface BoxShadow {
  /** Horizontal offset in px (may be negative). */
  x: number;
  /** Vertical offset in px (may be negative). */
  y: number;
  /** Blur radius in px (>= 0). */
  blur: number;
  /** Spread radius in px (may be negative). */
  spread: number;
  /** Any valid CSS color string. */
  color: string;
  /** Render as an inner shadow. */
  inset: boolean;
}

/**
 * Build a `box-shadow` value (without the property name or trailing `;`).
 * Always returns a valid string: empty/whitespace colors fall back to
 * `transparent`, and offsets/radii are coerced through `Number` so a stray
 * NaN can never leak into the rendered preview.
 */
export function buildBoxShadow({
  x,
  y,
  blur,
  spread,
  color,
  inset,
}: BoxShadow): string {
  const px = (n: number) => `${Number.isFinite(n) ? n : 0}px`;
  const safeColor = color.trim() || "transparent";
  const prefix = inset ? "inset " : "";
  return `${prefix}${px(x)} ${px(y)} ${px(blur)} ${px(spread)} ${safeColor}`;
}
