import { describe, expect, it } from "vitest";
import { extractPalette, quantizePalette } from "@/lib/tools/color-palette";

/** Build an RGBA buffer from a flat list of [r,g,b] triples (alpha = 255). */
function rgba(colors: Array<[number, number, number]>): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(colors.length * 4);
  colors.forEach(([r, g, b], i) => {
    buf[i * 4] = r;
    buf[i * 4 + 1] = g;
    buf[i * 4 + 2] = b;
    buf[i * 4 + 3] = 255;
  });
  return buf;
}

const RED: [number, number, number] = [255, 0, 0];
const BLUE: [number, number, number] = [0, 0, 255];

describe("extractPalette", () => {
  it("returns red + blue for a half-red half-blue image", () => {
    const pixels = rgba([...Array(50).fill(RED), ...Array(50).fill(BLUE)]);
    const palette = extractPalette(pixels, 2);
    expect(palette).toHaveLength(2);
    expect(palette).toContain("#ff0000");
    expect(palette).toContain("#0000ff");
  });

  it("returns an empty array for an empty buffer", () => {
    expect(extractPalette(new Uint8ClampedArray(0), 4)).toEqual([]);
  });

  it("skips fully transparent pixels", () => {
    const buf = new Uint8ClampedArray(8);
    // pixel 0: opaque red, pixel 1: transparent green
    buf.set([255, 0, 0, 255], 0);
    buf.set([0, 255, 0, 0], 4);
    expect(extractPalette(buf, 2)).toEqual(["#ff0000"]);
  });

  it("never returns more swatches than requested", () => {
    const pixels = rgba([
      [10, 10, 10],
      [120, 120, 120],
      [240, 240, 240],
      [200, 30, 30],
    ]);
    expect(extractPalette(pixels, 2).length).toBeLessThanOrEqual(2);
  });

  it("deduplicates identical bucket colors", () => {
    const pixels = rgba(Array(8).fill(RED));
    expect(extractPalette(pixels, 4)).toEqual(["#ff0000"]);
  });
});

describe("quantizePalette", () => {
  it("orders swatches by pixel count, most prominent first", () => {
    // Three well-separated clusters: median-cut isolates the lone green
    // pixel into its own small bucket, so counts are genuinely unequal and
    // the dominant red/blue mass sorts ahead of it.
    const pixels = rgba([
      ...Array(60).fill(RED),
      ...Array(39).fill(BLUE),
      [0, 255, 0],
    ]);
    const swatches = quantizePalette(pixels, 3);
    expect(swatches.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < swatches.length; i++) {
      expect(swatches[i - 1].count).toBeGreaterThanOrEqual(swatches[i].count);
    }
    expect(swatches[0].count).toBeGreaterThan(swatches[swatches.length - 1].count);
  });

  it("clamps a nonsensical count to at least one bucket", () => {
    const pixels = rgba([RED, BLUE]);
    expect(quantizePalette(pixels, 0).length).toBeGreaterThanOrEqual(1);
    expect(quantizePalette(pixels, Number.NaN).length).toBeGreaterThanOrEqual(1);
  });
});
