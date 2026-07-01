import { describe, it, expect } from "vitest";
import { analyzeImageIssues } from "@/lib/gallery/image-issues";

describe("analyzeImageIssues", () => {
  it("flags a blank alt", () => {
    expect(analyzeImageIssues({ alt: "  ", width: 1200, height: 1600 })).toEqual([
      { key: "missingAlt" },
    ]);
  });
  it("flags a too-small image", () => {
    expect(analyzeImageIssues({ alt: "ok", width: 640, height: 480 })).toEqual([
      { key: "tooSmall" },
    ]);
  });
  it("returns nothing for a good image", () => {
    expect(analyzeImageIssues({ alt: "ok", width: 2000, height: 1500 })).toEqual([]);
  });
  it("ignores unknown dimensions", () => {
    expect(analyzeImageIssues({ alt: "ok", width: null, height: null })).toEqual([]);
  });
});
