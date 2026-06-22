// Pure linear sRGB mix of two colors. No React, no DOM — unit-tested in
// tests/unit/tools/color-mix.test.ts. The Tool also offers CSS-native
// color-mix() in perceptual spaces; this gives a concrete, copyable RGB
// result and a deterministic preview that JS can actually compute.

import { clamp, type RGB } from "@/lib/tools/color";

/**
 * Linear interpolation between two RGB colors in sRGB.
 * `t` is the weight toward `b`, clamped to [0, 1]:
 *   t = 0 → a, t = 1 → b, t = 0.5 → midpoint.
 */
export function mixColors(a: RGB, b: RGB, t: number): RGB {
  const w = clamp(Number.isNaN(t) ? 0 : t, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * w),
    g: Math.round(a.g + (b.g - a.g) * w),
    b: Math.round(a.b + (b.b - a.b) * w),
  };
}
