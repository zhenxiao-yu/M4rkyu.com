import { describe, expect, it } from "vitest";

import {
  cryptoRandomInt,
  randomNumbers,
  RANDOM_NUMBER_MAX_COUNT,
  type RandomInt,
  type RandomNumberOptions,
} from "@/lib/tools/random-number";

/** Deterministic RNG: walks 0,1,2,… mod max so output is fully predictable. */
function sequentialRandom(): RandomInt {
  let n = 0;
  return (max: number) => (max <= 0 ? 0 : n++ % max);
}

const base: RandomNumberOptions = { min: 1, max: 100, count: 5, unique: false };

describe("randomNumbers", () => {
  it("returns count values all within the inclusive range", () => {
    const res = randomNumbers({ ...base, count: 50 }, sequentialRandom());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.values).toHaveLength(50);
    for (const v of res.values) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("respects the requested count", () => {
    for (const count of [1, 3, 10, 100]) {
      const res = randomNumbers({ ...base, count }, sequentialRandom());
      expect(res.ok && res.values.length).toBe(count);
    }
  });

  it("clamps count into [1, MAX_COUNT] defensively", () => {
    const zero = randomNumbers({ ...base, count: 0 }, sequentialRandom());
    expect(zero.ok && zero.values.length).toBe(1);

    const negative = randomNumbers({ ...base, count: -5 }, sequentialRandom());
    expect(negative.ok && negative.values.length).toBe(1);

    const huge = randomNumbers(
      { min: 1, max: 1_000_000, count: 5_000_000, unique: false },
      sequentialRandom(),
    );
    expect(huge.ok && huge.values.length).toBe(RANDOM_NUMBER_MAX_COUNT);
  });

  it("produces distinct values when unique is set", () => {
    const res = randomNumbers(
      { min: 1, max: 10, count: 10, unique: true },
      sequentialRandom(),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(new Set(res.values).size).toBe(res.values.length);
    expect([...res.values].sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });

  it("returns a typed error when unique count exceeds the range size", () => {
    const res = randomNumbers(
      { min: 1, max: 5, count: 6, unique: true },
      sequentialRandom(),
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe("count-exceeds-range");
    expect(res.rangeSize).toBe(5);
    expect(res.count).toBe(6);
  });

  it("allows non-unique draws to exceed the range size", () => {
    const res = randomNumbers(
      { min: 1, max: 3, count: 20, unique: false },
      sequentialRandom(),
    );
    expect(res.ok && res.values.length).toBe(20);
  });

  it("swaps min and max when min > max", () => {
    const res = randomNumbers(
      { min: 100, max: 1, count: 30, unique: false },
      sequentialRandom(),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.min).toBe(1);
    expect(res.max).toBe(100);
    for (const v of res.values) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("truncates fractional bounds before drawing", () => {
    const res = randomNumbers(
      { min: 1.9, max: 3.9, count: 10, unique: false },
      sequentialRandom(),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.min).toBe(1);
    expect(res.max).toBe(3);
    for (const v of res.values) expect([1, 2, 3]).toContain(v);
  });

  it("handles a single-value range", () => {
    const res = randomNumbers(
      { min: 7, max: 7, count: 4, unique: false },
      sequentialRandom(),
    );
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.values).toEqual([7, 7, 7, 7]);
  });
});

describe("cryptoRandomInt", () => {
  it("produces only in-range values and never loops on a benign source", () => {
    const fill = (arr: Uint32Array) => {
      arr[0] = 42;
      return arr;
    };
    const r = cryptoRandomInt(fill);
    for (let i = 0; i < 100; i++) {
      const v = r(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it("returns 0 for a non-positive bound", () => {
    const r = cryptoRandomInt((arr) => arr);
    expect(r(0)).toBe(0);
  });
});
