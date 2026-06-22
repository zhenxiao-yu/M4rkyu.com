import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  formatHsl,
  formatRgb,
  hslToRgb,
  parseHex,
  parseHslString,
  parseRgbString,
  rgbToHex,
  rgbToHsl,
} from "@/lib/tools/color";

describe("color parsing", () => {
  it("parses #rrggbb and round-trips to hex", () => {
    expect(parseHex("#7c3aed")).toEqual({ r: 124, g: 58, b: 237 });
    expect(rgbToHex({ r: 124, g: 58, b: 237 })).toBe("#7c3aed");
  });

  it("expands shorthand #rgb", () => {
    expect(parseHex("#f0a")).toEqual({ r: 255, g: 0, b: 170 });
  });

  it("accepts 8-digit hex and ignores alpha", () => {
    expect(parseHex("#7c3aedff")).toEqual({ r: 124, g: 58, b: 237 });
  });

  it("rejects malformed hex", () => {
    expect(parseHex("nope")).toBeNull();
    expect(parseHex("#12")).toBeNull();
  });

  it("parses rgb() and hsl() strings", () => {
    expect(parseRgbString("rgb(124, 58, 237)")).toEqual({ r: 124, g: 58, b: 237 });
    expect(parseHslString("hsl(262, 83%, 58%)")).toEqual({ h: 262, s: 83, l: 58 });
  });

  it("clamps out-of-range rgb channels", () => {
    expect(parseRgbString("rgb(300, -5, 9999)")).toEqual({ r: 255, g: 0, b: 255 });
  });

  it("returns null for too-few rgb parts", () => {
    expect(parseRgbString("rgb(1, 2)")).toBeNull();
  });
});

describe("color conversion", () => {
  it("round-trips rgb → hsl → rgb closely", () => {
    const rgb = { r: 124, g: 58, b: 237 };
    const back = hslToRgb(rgbToHsl(rgb));
    expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(2);
  });

  it("formats rgb/hsl", () => {
    expect(formatRgb({ r: 1, g: 2, b: 3 })).toBe("rgb(1, 2, 3)");
    expect(formatHsl({ h: 4, s: 5, l: 6 })).toBe("hsl(4, 5%, 6%)");
  });
});

describe("contrast", () => {
  it("black on white is the maximum 21:1", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it("identical colors are 1:1", () => {
    expect(contrastRatio({ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 })).toBeCloseTo(1, 5);
  });
});
