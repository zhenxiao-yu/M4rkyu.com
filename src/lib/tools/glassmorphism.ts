// Pure glassmorphism CSS builder. No React, no DOM — unit-tested in
// tests/unit/tools/glassmorphism.test.ts. Keeps the glassmorphism Tool free of
// stringly-typed assembly so the live preview, CSS output, and copy value all
// derive from one deterministic source.

export interface GlassStyle {
  /** Tint color as a 6-digit hex string (e.g. "#ffffff"). */
  color: string;
  /** Backdrop blur radius in px (>= 0). */
  blur: number;
  /** Backdrop saturation in % (>= 0). */
  saturation: number;
  /** Background fill alpha, 0–1. */
  bgAlpha: number;
  /** Border alpha, 0–1. */
  borderAlpha: number;
  /** Corner radius in px (>= 0). */
  radius: number;
}

/** Parse a 6-digit hex string into an "r, g, b" channel triple. */
export function hexToRgbTriple(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return "255, 255, 255";
  const n = Number.parseInt(match[1], 16);
  return `${(n >> 16) & 0xff}, ${(n >> 8) & 0xff}, ${n & 0xff}`;
}

/** Coerce a numeric value to a finite px string, clamping non-finite to 0. */
function px(n: number): string {
  return `${Number.isFinite(n) ? n : 0}px`;
}

/** Coerce a numeric value to a finite % string, clamping non-finite to 0. */
function pct(n: number): string {
  return `${Number.isFinite(n) ? n : 0}%`;
}

/** Clamp an alpha into [0, 1] and format with two decimals; NaN → 0. */
function alpha(n: number): string {
  const safe = Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
  return safe.toFixed(2);
}

/**
 * Build the individual glassmorphism declarations as discrete CSS values.
 * Shared between the inline preview style and the copyable CSS text so the two
 * can never drift. Every numeric input is coerced through finite guards, so a
 * stray NaN can never leak into the rendered preview.
 */
export function buildGlassValues(style: GlassStyle): {
  background: string;
  backdropFilter: string;
  border: string;
  borderRadius: string;
} {
  const rgb = hexToRgbTriple(style.color);
  const filter = `blur(${px(style.blur)}) saturate(${pct(style.saturation)})`;
  return {
    background: `rgba(${rgb}, ${alpha(style.bgAlpha)})`,
    backdropFilter: filter,
    border: `1px solid rgba(${rgb}, ${alpha(style.borderAlpha)})`,
    borderRadius: px(style.radius),
  };
}

/**
 * Build the full, copyable glassmorphism CSS block (newline-separated
 * declarations, no selector). Includes the `-webkit-` prefix for Safari.
 */
export function buildGlassCss(style: GlassStyle): string {
  const v = buildGlassValues(style);
  return [
    `background: ${v.background};`,
    `backdrop-filter: ${v.backdropFilter};`,
    `-webkit-backdrop-filter: ${v.backdropFilter};`,
    `border: ${v.border};`,
    `border-radius: ${v.borderRadius};`,
  ].join("\n");
}
