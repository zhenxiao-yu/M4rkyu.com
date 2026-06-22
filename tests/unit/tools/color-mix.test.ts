import { describe, expect, it } from "vitest";
import { mixColors } from "@/lib/tools/color-mix";
import type { RGB } from "@/lib/tools/color";

const A: RGB = { r: 0, g: 0, b: 0 };
const B: RGB = { r: 200, g: 100, b: 50 };

describe("mixColors", () => {
  it("returns a at t = 0", () => {
    expect(mixColors(A, B, 0)).toEqual(A);
  });

  it("returns b at t = 1", () => {
    expect(mixColors(A, B, 1)).toEqual(B);
  });

  it("returns the midpoint at t = 0.5", () => {
    expect(mixColors(A, B, 0.5)).toEqual({ r: 100, g: 50, b: 25 });
  });

  it("clamps t below 0 and above 1", () => {
    expect(mixColors(A, B, -1)).toEqual(A);
    expect(mixColors(A, B, 2)).toEqual(B);
  });

  it("coerces NaN weight to a", () => {
    expect(mixColors(A, B, Number.NaN)).toEqual(A);
  });
});
