import { describe, expect, it } from "vitest";
import { buildGradient, type GradientStop } from "@/lib/tools/gradient";

const STOPS: GradientStop[] = [
  { color: "#7c3aed", pos: 0 },
  { color: "#22d3ee", pos: 100 },
];

describe("buildGradient", () => {
  it("builds a linear gradient with two stops and the angle", () => {
    expect(buildGradient("linear", 135, STOPS)).toBe(
      "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
    );
  });

  it("builds a radial gradient (angle ignored)", () => {
    expect(buildGradient("radial", 135, STOPS)).toBe(
      "radial-gradient(circle, #7c3aed 0%, #22d3ee 100%)",
    );
  });

  it("builds a conic gradient with a from-angle", () => {
    expect(buildGradient("conic", 90, STOPS)).toBe(
      "conic-gradient(from 90deg, #7c3aed 0%, #22d3ee 100%)",
    );
  });

  it("respects a changed angle", () => {
    expect(buildGradient("linear", 45, STOPS)).toBe(
      "linear-gradient(45deg, #7c3aed 0%, #22d3ee 100%)",
    );
  });

  it("sorts stops by position", () => {
    const unsorted: GradientStop[] = [
      { color: "#000", pos: 100 },
      { color: "#fff", pos: 0 },
    ];
    expect(buildGradient("linear", 0, unsorted)).toBe(
      "linear-gradient(0deg, #fff 0%, #000 100%)",
    );
  });

  it("collapses non-finite angle and positions instead of emitting NaN", () => {
    const out = buildGradient("linear", Number.NaN, [
      { color: "#fff", pos: Number.NaN },
      { color: "#000", pos: 100 },
    ]);
    expect(out).not.toContain("NaN");
    expect(out).toBe("linear-gradient(0deg, #fff 0%, #000 100%)");
  });
});
