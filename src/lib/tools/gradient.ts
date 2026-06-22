// Pure CSS-gradient string builder. No React, no DOM — unit-tested in
// tests/unit/tools/gradient.test.ts. The Tool only owns input state and
// hands sorted, clamped stops here so the generated `background` value can
// never contain NaN or an out-of-order color sequence.

export type GradientType = "linear" | "radial" | "conic";

export interface GradientStop {
  /** Any CSS color (the Tool feeds a hex from <input type="color">). */
  color: string;
  /** Stop position in percent, expected in [0, 100]. */
  pos: number;
}

/**
 * Build a `linear-gradient()` / `radial-gradient()` / `conic-gradient()`
 * value from a list of stops.
 *
 * - Stops are sorted by position so dragging one past another still emits a
 *   valid, monotonic gradient.
 * - Non-finite positions collapse to 0 so a mid-edit NaN never reaches CSS.
 * - `angle` is the rotation in degrees: the line angle for `linear`, the
 *   `from {angle}deg` start for `conic`; ignored for `radial`.
 */
export function buildGradient(
  type: GradientType,
  angle: number,
  stops: GradientStop[],
): string {
  const safeAngle = Number.isFinite(angle) ? angle : 0;
  const stopStr = [...stops]
    .map((s) => ({
      color: s.color,
      pos: Number.isFinite(s.pos) ? s.pos : 0,
    }))
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.color} ${s.pos}%`)
    .join(", ");

  switch (type) {
    case "radial":
      return `radial-gradient(circle, ${stopStr})`;
    case "conic":
      return `conic-gradient(from ${safeAngle}deg, ${stopStr})`;
    case "linear":
    default:
      return `linear-gradient(${safeAngle}deg, ${stopStr})`;
  }
}
