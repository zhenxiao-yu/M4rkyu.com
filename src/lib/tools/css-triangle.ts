// Pure CSS-triangle (border-trick) builder. No React, no DOM — unit-tested in
// tests/unit/tools/css-triangle.test.ts. Keeps the Tool free of stringly-typed
// assembly so the live preview, CSS output, and copy value all derive from one
// deterministic source.

export type TriangleDirection = "up" | "down" | "left" | "right";

export const TRIANGLE_DIRECTIONS: readonly TriangleDirection[] = [
  "up",
  "down",
  "left",
  "right",
] as const;

/**
 * Build the CSS declarations for a border-trick triangle (without a selector
 * or wrapping braces). Always returns a valid string: a non-finite size is
 * coerced to 0 and an empty/whitespace color falls back to `currentColor`, so
 * a stray NaN or blank input can never leak into the rendered preview.
 *
 * The visible point faces `direction`; the two adjacent borders are
 * transparent and the opposite border carries the color.
 */
export function buildTriangle(
  direction: TriangleDirection,
  size: number,
  color: string,
): string {
  const px = `${Number.isFinite(size) ? Math.max(0, size) : 0}px`;
  const fill = color.trim() || "currentColor";
  const transparent = `${px} solid transparent`;
  const solid = `${px} solid ${fill}`;

  switch (direction) {
    case "up":
      return `width: 0; height: 0; border-left: ${transparent}; border-right: ${transparent}; border-bottom: ${solid};`;
    case "down":
      return `width: 0; height: 0; border-left: ${transparent}; border-right: ${transparent}; border-top: ${solid};`;
    case "left":
      return `width: 0; height: 0; border-top: ${transparent}; border-bottom: ${transparent}; border-right: ${solid};`;
    case "right":
      return `width: 0; height: 0; border-top: ${transparent}; border-bottom: ${transparent}; border-left: ${solid};`;
  }
}
