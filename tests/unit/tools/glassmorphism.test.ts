import { describe, expect, it } from "vitest";
import {
  buildGlassCss,
  buildGlassValues,
  hexToRgbTriple,
} from "@/lib/tools/glassmorphism";

const BASE = {
  color: "#ffffff",
  blur: 14,
  saturation: 180,
  bgAlpha: 0.25,
  borderAlpha: 0.18,
  radius: 16,
};

describe("hexToRgbTriple", () => {
  it("parses a 6-digit hex into channels", () => {
    expect(hexToRgbTriple("#3b82f6")).toBe("59, 130, 246");
  });

  it("falls back to white for invalid input", () => {
    expect(hexToRgbTriple("nope")).toBe("255, 255, 255");
  });
});

describe("buildGlassValues", () => {
  it("builds a translucent rgba background and border", () => {
    const v = buildGlassValues(BASE);
    expect(v.background).toBe("rgba(255, 255, 255, 0.25)");
    expect(v.border).toBe("1px solid rgba(255, 255, 255, 0.18)");
  });

  it("composes the blur + saturate backdrop filter", () => {
    expect(buildGlassValues(BASE).backdropFilter).toBe(
      "blur(14px) saturate(180%)",
    );
  });

  it("clamps alpha into [0, 1] and coerces non-finite numbers", () => {
    const v = buildGlassValues({
      ...BASE,
      blur: Number.NaN,
      bgAlpha: 2,
      borderAlpha: -1,
    });
    expect(v.backdropFilter).toBe("blur(0px) saturate(180%)");
    expect(v.background).toBe("rgba(255, 255, 255, 1.00)");
    expect(v.border).toBe("1px solid rgba(255, 255, 255, 0.00)");
  });
});

describe("buildGlassCss", () => {
  it("emits blur, rgba background, and border declarations", () => {
    const css = buildGlassCss(BASE);
    expect(css).toContain("background: rgba(255, 255, 255, 0.25);");
    expect(css).toContain("backdrop-filter: blur(14px) saturate(180%);");
    expect(css).toContain(
      "-webkit-backdrop-filter: blur(14px) saturate(180%);",
    );
    expect(css).toContain("border: 1px solid rgba(255, 255, 255, 0.18);");
    expect(css).toContain("border-radius: 16px;");
  });
});
