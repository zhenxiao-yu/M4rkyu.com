// Pure random-number generation for the random-number tool. No React, no DOM,
// no crypto import — the caller injects an unbiased RandomInt so the module
// stays fully deterministic under test (tests/unit/tools/random-number.test.ts)
// while the component feeds it crypto.getRandomValues in the browser.
//
// Entropy is never Math.random in production: the component builds the RandomInt
// from crypto.getRandomValues with rejection sampling (cryptoRandomInt below),
// so every integer in [min, max] is equally likely (modulo-bias free).

/** Largest batch the generator will draw — guards against UI freezes. */
export const RANDOM_NUMBER_MIN_COUNT = 1;
export const RANDOM_NUMBER_MAX_COUNT = 1000;

export interface RandomNumberOptions {
  min: number;
  max: number;
  count: number;
  /** When true, every drawn value is distinct (sampling without replacement). */
  unique: boolean;
}

/**
 * A function returning a uniformly random integer in [0, maxExclusive). The
 * component passes a `crypto.getRandomValues`-backed implementation; tests pass
 * a deterministic stub. Implementations are expected to be unbiased so callers
 * don't have to reason about modulo bias.
 */
export type RandomInt = (maxExclusive: number) => number;

/**
 * Build an unbiased RandomInt from crypto.getRandomValues using rejection
 * sampling. Discards the small tail of 32-bit values that would skew a plain
 * modulo, so every outcome is equally likely.
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

export type RandomNumberError = "count-exceeds-range";

export interface RandomNumberSuccess {
  ok: true;
  values: number[];
  /** Effective bounds after a min > max swap, so the UI can report what ran. */
  min: number;
  max: number;
}

export interface RandomNumberFailure {
  ok: false;
  error: RandomNumberError;
  /** Size of the inclusive [min, max] range, for an ICU-formatted message. */
  rangeSize: number;
  count: number;
}

export type RandomNumberResult = RandomNumberSuccess | RandomNumberFailure;

/**
 * Draw `count` integers in the inclusive range [min, max].
 *
 * Robustness contract (the component clamps too, but this stays defensive so a
 * stray value can never loop forever or allocate an absurd array):
 *  - min/max are truncated to ints; if min > max they are swapped silently.
 *  - count is truncated and clamped into [MIN_COUNT, MAX_COUNT].
 *  - `unique` draws without replacement. If count exceeds the range size the
 *    request is impossible, so a typed failure is returned (never a partial or
 *    looping result) for the caller to surface as a localized error.
 */
export function randomNumbers(
  opts: RandomNumberOptions,
  randomInt: RandomInt,
): RandomNumberResult {
  const a = Math.trunc(opts.min);
  const b = Math.trunc(opts.max);
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  const rangeSize = max - min + 1;

  const count = Math.max(
    RANDOM_NUMBER_MIN_COUNT,
    Math.min(RANDOM_NUMBER_MAX_COUNT, Math.trunc(opts.count) || RANDOM_NUMBER_MIN_COUNT),
  );

  if (opts.unique && count > rangeSize) {
    return { ok: false, error: "count-exceeds-range", rangeSize, count };
  }

  const draw = () => min + randomInt(rangeSize);

  if (opts.unique) {
    const seen = new Set<number>();
    const values: number[] = [];
    // Terminates: count <= rangeSize guarantees the set can reach `count`.
    while (values.length < count) {
      const v = draw();
      if (!seen.has(v)) {
        seen.add(v);
        values.push(v);
      }
    }
    return { ok: true, values, min, max };
  }

  const values: number[] = new Array(count);
  for (let i = 0; i < count; i++) values[i] = draw();
  return { ok: true, values, min, max };
}
