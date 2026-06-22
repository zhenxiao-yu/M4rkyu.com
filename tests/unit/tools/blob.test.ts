import { describe, expect, it } from "vitest";
import {
  BLOB_LIMITS,
  BLOB_SIZE,
  buildBlobClipPath,
  buildBlobSvg,
  generateBlob,
  mulberry32,
} from "@/lib/tools/blob";

const PARAMS = { complexity: 6, contrast: 50, seed: 1337 } as const;

describe("generateBlob", () => {
  it("produces a valid path string starting with M and closing with Z", () => {
    const { path } = generateBlob(PARAMS);
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(path).toContain("C");
  });

  it("is deterministic — same seed yields the same path", () => {
    const a = generateBlob(PARAMS);
    const b = generateBlob(PARAMS);
    expect(a.path).toBe(b.path);
  });

  it("yields a different path for a different seed", () => {
    const a = generateBlob({ ...PARAMS, seed: 1 });
    const b = generateBlob({ ...PARAMS, seed: 2 });
    expect(a.path).not.toBe(b.path);
  });

  it("emits one cubic segment per vertex (complexity drives point count)", () => {
    const low = generateBlob({ ...PARAMS, complexity: 4 });
    const high = generateBlob({ ...PARAMS, complexity: 10 });
    expect(low.points).toBe(4);
    expect(high.points).toBe(10);
    const countC = (s: string) => (s.match(/C/g) ?? []).length;
    expect(countC(low.path)).toBe(4);
    expect(countC(high.path)).toBe(10);
  });

  it("never emits NaN even with non-finite inputs", () => {
    const { path } = generateBlob({
      complexity: Number.NaN,
      contrast: Number.NaN,
      seed: Number.NaN,
    });
    expect(path).not.toContain("NaN");
    expect(path.startsWith("M")).toBe(true);
  });

  it("clamps complexity and contrast into their limits", () => {
    const over = generateBlob({ complexity: 999, contrast: 999, seed: 1 });
    const under = generateBlob({ complexity: -5, contrast: -5, seed: 1 });
    expect(over.points).toBe(BLOB_LIMITS.complexity.max);
    expect(under.points).toBe(BLOB_LIMITS.complexity.min);
  });

  it("accepts an injected rng for deterministic testing", () => {
    const constRng = () => 0.5;
    const a = generateBlob(PARAMS, constRng);
    const b = generateBlob({ ...PARAMS, seed: 9999 }, constRng);
    // With a fixed rng the seed is irrelevant — both paths match.
    expect(a.path).toBe(b.path);
  });

  it("reports the canonical viewBox size", () => {
    expect(generateBlob(PARAMS).size).toBe(BLOB_SIZE);
  });
});

describe("mulberry32", () => {
  it("returns the same sequence for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("returns floats in [0, 1)", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("buildBlobSvg / buildBlobClipPath", () => {
  it("wraps the path in a standalone svg with the fill", () => {
    const svg = buildBlobSvg("M0,0Z", "#0ea5b7");
    expect(svg).toContain(`viewBox="0 0 ${BLOB_SIZE} ${BLOB_SIZE}"`);
    expect(svg).toContain('fill="#0ea5b7"');
    expect(svg).toContain('d="M0,0Z"');
  });

  it("emits a css clip-path declaration", () => {
    expect(buildBlobClipPath("M0,0Z")).toBe('clip-path: path("M0,0Z");');
  });
});
