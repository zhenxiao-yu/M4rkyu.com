// Pure password generation + strength scoring. No React, no DOM, no crypto
// import — the caller injects a random source so the module stays fully
// deterministic under test (tests/unit/tools/password.test.ts) while the
// component feeds it crypto.getRandomValues in the browser.

export interface PasswordOptions {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  /** Drop visually confusable glyphs (0 O I l 1) from the pool. */
  noAmbiguous: boolean;
}

/** A character class the user can toggle. Order is the UI order. */
export const PASSWORD_CLASSES = [
  "lower",
  "upper",
  "digits",
  "symbols",
] as const;

export type PasswordClass = (typeof PASSWORD_CLASSES)[number];

/** Allowed password length range, shared by the UI clamp and the generator. */
export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 128;

const SETS: Record<PasswordClass, string> = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

const AMBIGUOUS = /[0OIl1]/g;

/**
 * A function returning uniformly random integers in [0, max). The component
 * passes a `crypto.getRandomValues`-backed implementation; tests pass a
 * deterministic stub. Implementations are expected to be unbiased (rejection
 * sampling) so callers don't have to reason about modulo bias.
 */
export type RandomInt = (maxExclusive: number) => number;

/**
 * Build an unbiased RandomInt from crypto.getRandomValues using rejection
 * sampling. Discards the small tail of 32-bit values that would skew a plain
 * modulo, so every glyph in the pool is equally likely.
 */
export function cryptoRandomInt(
  getRandomValues: (array: Uint32Array) => Uint32Array,
): RandomInt {
  const buf = new Uint32Array(1);
  return (maxExclusive: number): number => {
    if (maxExclusive <= 0) return 0;
    // Largest multiple of maxExclusive that fits in a uint32; values at or
    // above it are rejected to keep the distribution uniform.
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    let x = 0;
    do {
      getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % maxExclusive;
  };
}

/** Resolve the effective character pool for the given options. */
export function buildPool(opts: PasswordOptions): string {
  let pool = "";
  if (opts.lower) pool += SETS.lower;
  if (opts.upper) pool += SETS.upper;
  if (opts.digits) pool += SETS.digits;
  if (opts.symbols) pool += SETS.symbols;
  if (opts.noAmbiguous) pool = pool.replace(AMBIGUOUS, "");
  return pool;
}

/** True when at least one class is on AND the resulting pool is non-empty. */
export function hasUsablePool(opts: PasswordOptions): boolean {
  return buildPool(opts).length > 0;
}

/**
 * Generate a password. Returns "" only when no usable pool exists — the caller
 * is responsible for guarding the UI so an empty pool can never be reached
 * (Generate is disabled with a hint). `length` is assumed pre-clamped by the
 * caller, but we still clamp defensively so a stray value can't loop forever
 * or allocate absurd strings.
 */
export function generatePassword(
  opts: PasswordOptions,
  randomInt: RandomInt,
): string {
  const pool = buildPool(opts);
  if (pool.length === 0) return "";
  const length = Math.max(
    PASSWORD_MIN_LENGTH,
    Math.min(PASSWORD_MAX_LENGTH, Math.trunc(opts.length) || PASSWORD_MIN_LENGTH),
  );
  let out = "";
  for (let i = 0; i < length; i++) out += pool[randomInt(pool.length)];
  return out;
}

export type StrengthLevel = "weak" | "fair" | "good" | "strong";

export interface StrengthResult {
  /** Estimated Shannon entropy of the *generation policy*, in bits. */
  bits: number;
  level: StrengthLevel;
  /** 0–100 for the meter; saturates at ~100 bits. */
  pct: number;
}

const STRENGTH_CAP_BITS = 100;

/**
 * Score strength from observed character classes + length, not from the exact
 * string, so the meter reflects the generator policy. Entropy ≈ length ·
 * log2(poolSize); thresholds map to four localized levels.
 */
export function scoreStrength(password: string): StrengthResult {
  if (!password) return { bits: 0, level: "weak", pct: 0 };
  const poolSize =
    (/[a-z]/.test(password) ? 26 : 0) +
    (/[A-Z]/.test(password) ? 26 : 0) +
    (/[0-9]/.test(password) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(password) ? 32 : 0);
  const bits = Math.round(password.length * Math.log2(Math.max(poolSize, 2)));
  const level: StrengthLevel =
    bits >= 80 ? "strong" : bits >= 56 ? "good" : bits >= 36 ? "fair" : "weak";
  const pct = Math.min(100, Math.round((bits / STRENGTH_CAP_BITS) * 100));
  return { bits, level, pct };
}
