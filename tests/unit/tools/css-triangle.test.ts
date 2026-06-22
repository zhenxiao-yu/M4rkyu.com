import { describe, expect, it } from "vitest";
import { buildTriangle, TRIANGLE_DIRECTIONS } from "@/lib/tools/css-triangle";

describe("buildTriangle", () => {
  it("points up via a colored bottom border + transparent sides", () => {
    expect(buildTriangle("up", 48, "#7c3aed")).toBe(
      "width: 0; height: 0; border-left: 48px solid transparent; border-right: 48px solid transparent; border-bottom: 48px solid #7c3aed;",
    );
  });

  it("points down via a colored top border + transparent sides", () => {
    expect(buildTriangle("down", 48, "#7c3aed")).toBe(
      "width: 0; height: 0; border-left: 48px solid transparent; border-right: 48px solid transparent; border-top: 48px solid #7c3aed;",
    );
  });

  it("points left via a colored right border + transparent top/bottom", () => {
    expect(buildTriangle("left", 48, "#7c3aed")).toBe(
      "width: 0; height: 0; border-top: 48px solid transparent; border-bottom: 48px solid transparent; border-right: 48px solid #7c3aed;",
    );
  });

  it("points right via a colored left border + transparent top/bottom", () => {
    expect(buildTriangle("right", 48, "#7c3aed")).toBe(
      "width: 0; height: 0; border-top: 48px solid transparent; border-bottom: 48px solid transparent; border-left: 48px solid #7c3aed;",
    );
  });

  it("colors exactly one border and leaves the others transparent", () => {
    for (const direction of TRIANGLE_DIRECTIONS) {
      const css = buildTriangle(direction, 20, "#abc");
      const transparentCount = (css.match(/solid transparent/g) ?? []).length;
      const coloredCount = (css.match(/solid #abc/g) ?? []).length;
      expect(transparentCount).toBe(2);
      expect(coloredCount).toBe(1);
    }
  });

  it("coerces a non-finite size to 0px", () => {
    expect(buildTriangle("up", Number.NaN, "#000")).toBe(
      "width: 0; height: 0; border-left: 0px solid transparent; border-right: 0px solid transparent; border-bottom: 0px solid #000;",
    );
  });

  it("clamps a negative size to 0px", () => {
    expect(buildTriangle("up", -10, "#000")).toContain("0px solid #000");
  });

  it("falls back to currentColor for an empty color", () => {
    expect(buildTriangle("up", 24, "   ")).toContain(
      "border-bottom: 24px solid currentColor;",
    );
  });
});
