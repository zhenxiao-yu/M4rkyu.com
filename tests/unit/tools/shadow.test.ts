import { describe, expect, it } from "vitest";
import { buildBoxShadow } from "@/lib/tools/shadow";

const BASE = {
  x: 0,
  y: 12,
  blur: 32,
  spread: -8,
  color: "rgba(15, 23, 42, 0.25)",
  inset: false,
};

describe("buildBoxShadow", () => {
  it("builds a basic outer shadow", () => {
    expect(buildBoxShadow(BASE)).toBe("0px 12px 32px -8px rgba(15, 23, 42, 0.25)");
  });

  it("prefixes inset shadows", () => {
    expect(buildBoxShadow({ ...BASE, inset: true })).toBe(
      "inset 0px 12px 32px -8px rgba(15, 23, 42, 0.25)",
    );
  });

  it("renders negative offsets", () => {
    expect(
      buildBoxShadow({ x: -6, y: -4, blur: 0, spread: 0, color: "#000", inset: false }),
    ).toBe("-6px -4px 0px 0px #000");
  });

  it("coerces non-finite numbers to 0px", () => {
    expect(
      buildBoxShadow({ ...BASE, x: Number.NaN, blur: Number.POSITIVE_INFINITY }),
    ).toBe("0px 12px 0px -8px rgba(15, 23, 42, 0.25)");
  });

  it("falls back to transparent for an empty color", () => {
    expect(buildBoxShadow({ ...BASE, color: "   " })).toBe(
      "0px 12px 32px -8px transparent",
    );
  });
});
