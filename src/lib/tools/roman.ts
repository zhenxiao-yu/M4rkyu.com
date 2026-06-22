// Pure Arabic ↔ Roman conversion shared by the roman tool. No React, no DOM —
// unit-tested in tests/unit/tools/roman.test.ts.
//
// Both directions are total: out-of-range / malformed / empty input returns
// `null` rather than throwing, so the UI can render a localized hint instead of
// crashing. Classical Roman numerals only span 1–3999 (no vinculum / overbar
// notation), which is the range this module enforces.

export const ROMAN_MIN = 1;
export const ROMAN_MAX = 3999;

const VALUES: readonly [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

/**
 * Convert an integer in [1, 3999] to its canonical Roman numeral, or `null` if
 * the value is not an integer or falls outside the representable range.
 */
export function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < ROMAN_MIN || n > ROMAN_MAX) return null;
  let remaining = n;
  let out = "";
  for (const [value, symbol] of VALUES) {
    while (remaining >= value) {
      out += symbol;
      remaining -= value;
    }
  }
  return out;
}

/**
 * Convert a Roman numeral string to its integer value, or `null` if it is
 * empty or not a *canonical* numeral. Whitespace is trimmed and casing is
 * normalized, but the strict check rejects non-canonical forms such as "IIII",
 * "VV", "IC", or "XM": the parsed total is re-encoded with `toRoman` and must
 * round-trip exactly back to the input, so only one valid spelling per number
 * is accepted.
 */
export function fromRoman(raw: string): number | null {
  const trimmed = raw.trim().toUpperCase();
  if (trimmed === "" || !/^[MDCLXVI]+$/.test(trimmed)) return null;

  let total = 0;
  let i = 0;
  while (i < trimmed.length) {
    const two = trimmed.slice(i, i + 2);
    const matchTwo = VALUES.find(([, symbol]) => symbol === two);
    if (matchTwo) {
      total += matchTwo[0];
      i += 2;
      continue;
    }
    const one = trimmed[i];
    const matchOne = VALUES.find(([, symbol]) => symbol === one);
    if (!matchOne) return null;
    total += matchOne[0];
    i += 1;
  }

  // Canonical-form guard: only the single legal spelling round-trips.
  return toRoman(total) === trimmed ? total : null;
}
