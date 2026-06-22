// Pure base-conversion logic shared by the base-converter tool. No React, no
// DOM — unit-tested in tests/unit/tools/base-converter.test.ts.
//
// Integers are parsed/serialized with BigInt so arbitrarily large values stay
// exact (no Number precision loss past 2^53). Parsing is total: malformed or
// empty input returns `null` rather than throwing, so the UI can render a
// localized "invalid" hint instead of crashing.

export const BASES = [2, 8, 10, 16] as const;
export type Base = (typeof BASES)[number];

const DIGITS = "0123456789abcdef";

/**
 * Parse a string in the given base into a BigInt, or `null` if it is empty or
 * contains a digit out of range for the base. Accepts a leading `0b` / `0o` /
 * `0x` prefix (case-insensitive) and `_` group separators, both of which are
 * stripped before parsing. Whitespace is trimmed.
 */
export function bigIntFromBase(raw: string, base: Base): bigint | null {
  if (!raw) return null;
  const cleaned = raw
    .trim()
    .replace(/^0[bxo]/i, "")
    .replace(/_/g, "")
    .toLowerCase();
  if (!cleaned) return null;
  let result = 0n;
  const bigBase = BigInt(base);
  for (const ch of cleaned) {
    const v = DIGITS.indexOf(ch);
    if (v < 0 || v >= base) return null;
    result = result * bigBase + BigInt(v);
  }
  return result;
}

/** Serialize a BigInt to its string representation in the given base. */
export function toBase(value: bigint, base: Base): string {
  return value.toString(base);
}
