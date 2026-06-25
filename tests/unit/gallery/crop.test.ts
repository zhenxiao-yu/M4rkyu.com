import { describe, expect, it } from "vitest";
import {
  clampRect,
  fitRect,
  moveRect,
  parseAspectRatio,
  resizeRect,
  type Bounds,
} from "@/lib/gallery/crop";

const BOUNDS: Bounds = { w: 1000, h: 800 };

describe("parseAspectRatio", () => {
  it("parses each gallery ratio to a number", () => {
    expect(parseAspectRatio("1/1")).toBe(1);
    expect(parseAspectRatio("4/5")).toBeCloseTo(0.8);
    expect(parseAspectRatio("16/9")).toBeCloseTo(1.7778, 3);
    expect(parseAspectRatio("21/9")).toBeCloseTo(2.3333, 3);
  });
  it("returns null for free and garbage", () => {
    expect(parseAspectRatio("free")).toBeNull();
    expect(parseAspectRatio("x")).toBeNull();
    expect(parseAspectRatio("0/5")).toBeNull();
  });
});

describe("fitRect", () => {
  it("returns the full box for a null (free) ratio", () => {
    expect(fitRect(1000, 800, null)).toEqual({ x: 0, y: 0, w: 1000, h: 800 });
  });
  it("centers and fits a wide ratio (height-limited becomes width-limited)", () => {
    // 1:1 inside 1000x800 → 800x800 centered horizontally.
    const r = fitRect(1000, 800, 1);
    expect(r.w).toBeCloseTo(800);
    expect(r.h).toBeCloseTo(800);
    expect(r.x).toBeCloseTo(100);
    expect(r.y).toBeCloseTo(0);
  });
  it("never exceeds the bounds for any gallery aspect", () => {
    for (const ratio of [1, 0.8, 0.75, 0.6667, 1.7778, 2.3333]) {
      const r = fitRect(1000, 800, ratio);
      expect(r.w).toBeLessThanOrEqual(1000 + 0.01);
      expect(r.h).toBeLessThanOrEqual(800 + 0.01);
      expect(r.x).toBeGreaterThanOrEqual(-0.01);
      expect(r.y).toBeGreaterThanOrEqual(-0.01);
      expect(r.w / r.h).toBeCloseTo(ratio, 3);
    }
  });
});

describe("clampRect", () => {
  it("pulls an out-of-bounds rect back inside", () => {
    const r = clampRect({ x: -50, y: -20, w: 200, h: 100 }, BOUNDS);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.w).toBe(200);
    expect(r.h).toBe(100);
  });
  it("clamps an oversized rect to the bounds", () => {
    const r = clampRect({ x: 0, y: 0, w: 5000, h: 5000 }, BOUNDS);
    expect(r.w).toBe(1000);
    expect(r.h).toBe(800);
  });
  it("keeps a rect flush against the far edge", () => {
    const r = clampRect({ x: 900, y: 700, w: 300, h: 300 }, BOUNDS);
    expect(r.x + r.w).toBeLessThanOrEqual(1000);
    expect(r.y + r.h).toBeLessThanOrEqual(800);
  });
});

describe("moveRect", () => {
  it("translates and clamps to bounds", () => {
    const r = moveRect({ x: 100, y: 100, w: 200, h: 200 }, -500, 50, BOUNDS);
    expect(r.x).toBe(0); // clamped at left edge
    expect(r.y).toBe(150);
    expect(r.w).toBe(200);
  });
});

describe("resizeRect", () => {
  const base = { x: 200, y: 200, w: 400, h: 300 };

  it("free resize grows the east edge", () => {
    const r = resizeRect(base, "e", 100, 0, null, BOUNDS);
    expect(r.w).toBe(500);
    expect(r.x).toBe(200);
    expect(r.h).toBe(300);
  });

  it("aspect-locked resize derives the dependent dimension", () => {
    const r = resizeRect(base, "e", 100, 0, 1, BOUNDS); // 1:1
    expect(r.w).toBeCloseTo(r.h, 3);
  });

  it("enforces the minimum size", () => {
    const r = resizeRect(base, "e", -1000, 0, null, BOUNDS);
    expect(r.w).toBeGreaterThanOrEqual(32);
  });

  it("never escapes the bounds when dragging a corner", () => {
    const r = resizeRect(base, "se", 5000, 5000, null, BOUNDS);
    expect(r.x + r.w).toBeLessThanOrEqual(1000 + 0.01);
    expect(r.y + r.h).toBeLessThanOrEqual(800 + 0.01);
  });
});
