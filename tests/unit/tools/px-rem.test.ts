import { describe, expect, it } from "vitest";

import { DEFAULT_BASE, pxToRem, remToPx, safeBase } from "@/lib/tools/px-rem";

describe("pxToRem", () => {
  it("treats 16px as 1rem at the default base", () => {
    expect(pxToRem(16, 16)).toBe(1);
    expect(pxToRem(24, 16)).toBe(1.5);
    expect(pxToRem(8, 16)).toBe(0.5);
  });

  it("honors a custom base", () => {
    expect(pxToRem(20, 10)).toBe(2);
    expect(pxToRem(15, 10)).toBe(1.5);
  });

  it("falls back to a 16px base when base is 0 (no Infinity/NaN)", () => {
    expect(pxToRem(16, 0)).toBe(1);
    expect(Number.isFinite(pxToRem(32, 0))).toBe(true);
    expect(pxToRem(32, 0)).toBe(2);
  });

  it("falls back when base is negative or non-finite", () => {
    expect(pxToRem(16, -8)).toBe(1);
    expect(pxToRem(16, Number.NaN)).toBe(1);
  });

  it("returns 0 for a non-finite px input rather than NaN", () => {
    expect(pxToRem(Number.NaN, 16)).toBe(0);
  });
});

describe("remToPx", () => {
  it("treats 1rem as 16px at the default base", () => {
    expect(remToPx(1, 16)).toBe(16);
    expect(remToPx(1.5, 16)).toBe(24);
  });

  it("honors a custom base", () => {
    expect(remToPx(2, 10)).toBe(20);
  });

  it("falls back to a 16px base when base is 0", () => {
    expect(remToPx(1, 0)).toBe(16);
    expect(Number.isFinite(remToPx(2, 0))).toBe(true);
  });

  it("returns 0 for a non-finite rem input", () => {
    expect(remToPx(Number.NaN, 16)).toBe(0);
  });

  it("round-trips with pxToRem", () => {
    for (const base of [10, 12, 16, 20]) {
      expect(remToPx(pxToRem(48, base), base)).toBe(48);
    }
  });
});

describe("safeBase", () => {
  it("passes through valid positive bases", () => {
    expect(safeBase(10)).toBe(10);
  });

  it("substitutes the default for unusable bases", () => {
    expect(safeBase(0)).toBe(DEFAULT_BASE);
    expect(safeBase(-1)).toBe(DEFAULT_BASE);
    expect(safeBase(Number.NaN)).toBe(DEFAULT_BASE);
    expect(safeBase(Number.POSITIVE_INFINITY)).toBe(DEFAULT_BASE);
  });
});
