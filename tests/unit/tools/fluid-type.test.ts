import { describe, expect, it } from "vitest";
import { buildFluidType, resolveFluidPx } from "@/lib/tools/fluid-type";

describe("buildFluidType", () => {
  it("computes the expected slope and intercept for a known range", () => {
    // 16px @360 → 40px @1280, 16px root.
    // slope = (40 - 16) / (1280 - 360) = 24 / 920 = 0.0260869…
    // vw    = slope * 100 = 2.6087 (4dp)
    // interceptPx = 16 - slope * 360 = 16 - 9.391304… = 6.608695…
    // → 6.608695 / 16 = 0.413043…rem (0.413 at 4dp -> 0.413)
    const r = buildFluidType({ minFont: 16, maxFont: 40, minVw: 360, maxVw: 1280 });
    expect(r.ok).toBe(true);
    expect(r.slope).toBeCloseTo(24 / 920, 10);
    expect(r.vw).toBeCloseTo(2.6087, 4);
    expect(r.interceptPx).toBeCloseTo(6.6087, 4);
    expect(r.clamp).toBe("clamp(1rem, 2.6087vw + 0.413rem, 2.5rem)");
  });

  it("orders the clamp bounds regardless of input order", () => {
    const r = buildFluidType({ minFont: 40, maxFont: 16, minVw: 360, maxVw: 1280 });
    // lo bound = min(40,16)/16 = 1rem, hi bound = 2.5rem
    expect(r.clamp.startsWith("clamp(1rem,")).toBe(true);
    expect(r.clamp.endsWith("2.5rem)")).toBe(true);
  });

  it("guards equal viewports (divide-by-zero) with a flat clamp", () => {
    const r = buildFluidType({ minFont: 16, maxFont: 40, minVw: 768, maxVw: 768 });
    expect(r.ok).toBe(false);
    expect(r.slope).toBe(0);
    expect(Number.isFinite(r.vw)).toBe(true);
    expect(Number.isFinite(r.interceptPx)).toBe(true);
    // Flat, valid clamp — no Infinityvw / NaNrem.
    expect(r.clamp).toBe("clamp(1rem, 1rem, 2.5rem)");
    expect(r.clamp).not.toMatch(/NaN|Infinity/);
  });

  it("never emits NaN/Infinity for non-finite inputs", () => {
    const r = buildFluidType({
      minFont: Number.NaN,
      maxFont: Number.POSITIVE_INFINITY,
      minVw: 360,
      maxVw: 1280,
    });
    expect(r.clamp).not.toMatch(/NaN|Infinity/);
  });

  it("honours a custom root size", () => {
    // 20px @10px root → 2rem
    const r = buildFluidType({ minFont: 20, maxFont: 20, minVw: 360, maxVw: 1280, base: 10 });
    expect(r.clamp.startsWith("clamp(2rem,")).toBe(true);
  });
});

describe("resolveFluidPx", () => {
  it("interpolates linearly inside the range", () => {
    const r = buildFluidType({ minFont: 16, maxFont: 40, minVw: 360, maxVw: 1280 });
    // midpoint viewport 820 → ~28px
    expect(resolveFluidPx(r, 820, 16, 40)).toBe(28);
  });

  it("locks to the bounds outside the range", () => {
    const r = buildFluidType({ minFont: 16, maxFont: 40, minVw: 360, maxVw: 1280 });
    expect(resolveFluidPx(r, 100, 16, 40)).toBe(16);
    expect(resolveFluidPx(r, 4000, 16, 40)).toBe(40);
  });
});
