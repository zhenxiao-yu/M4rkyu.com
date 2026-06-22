import { describe, expect, it } from "vitest";
import {
  clampBezierPoint,
  clampBezierPoints,
  formatCubicBezier,
  roundCoord,
} from "@/lib/tools/bezier";

describe("clampBezierPoint", () => {
  it("clamps x into [0, 1]", () => {
    expect(clampBezierPoint(-0.4, 0.5).x).toBe(0);
    expect(clampBezierPoint(1.6, 0.5).x).toBe(1);
    expect(clampBezierPoint(0.42, 0.5).x).toBe(0.42);
  });

  it("leaves y unclamped for overshoot easings", () => {
    expect(clampBezierPoint(0.5, 1.7).y).toBe(1.7);
    expect(clampBezierPoint(0.5, -0.6).y).toBe(-0.6);
  });

  it("coerces non-finite coordinates to 0", () => {
    expect(clampBezierPoint(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({
      x: 0,
      y: 0,
    });
  });
});

describe("roundCoord", () => {
  it("rounds to 3 decimals", () => {
    expect(roundCoord(0.123456)).toBe(0.123);
  });

  it("coerces non-finite numbers to 0", () => {
    expect(roundCoord(Number.NaN)).toBe(0);
    expect(roundCoord(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("clampBezierPoints", () => {
  it("clamps both x values but not y", () => {
    expect(
      clampBezierPoints({ x1: -0.2, y1: 1.5, x2: 1.4, y2: -0.3 }),
    ).toEqual({ x1: 0, y1: 1.5, x2: 1, y2: -0.3 });
  });
});

describe("formatCubicBezier", () => {
  it("formats a standard easing", () => {
    expect(formatCubicBezier({ x1: 0.42, y1: 0, x2: 0.58, y2: 1 })).toBe(
      "cubic-bezier(0.42, 0, 0.58, 1)",
    );
  });

  it("emits a legal value even from out-of-range input", () => {
    expect(formatCubicBezier({ x1: 2, y1: 1.8, x2: -1, y2: -0.5 })).toBe(
      "cubic-bezier(1, 1.8, 0, -0.5)",
    );
  });

  it("rounds noisy coordinates", () => {
    expect(
      formatCubicBezier({ x1: 0.255555, y1: 0.1, x2: 0.25, y2: 1 }),
    ).toBe("cubic-bezier(0.256, 0.1, 0.25, 1)");
  });
});
