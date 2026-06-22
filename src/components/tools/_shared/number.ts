/**
 * NaN-safe numeric parsing + clamping for tool inputs. Free functions so
 * they stay unit-testable and shared across timestamp / random-number /
 * gradient / px-rem / fluid-type / base-converter, where raw input strings
 * routinely produced NaN that leaked into the UI.
 */

export function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function parseIntSafe(raw: string, fallback = 0): number {
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function parseFloatSafe(raw: string, fallback = 0): number {
  const n = Number.parseFloat(raw);
  return Number.isNaN(n) ? fallback : n;
}

/** Parse → truncate to int → clamp into [min, max]. */
export function clampInt(
  raw: string,
  min: number,
  max: number,
  fallback = min,
): number {
  return clampNumber(Math.trunc(parseFloatSafe(raw, fallback)), min, max);
}
