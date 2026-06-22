import { describe, expect, it } from "vitest";
import { buildBoxModelCss, outerSize } from "@/lib/tools/box-model";

const BASE = {
  width: 200,
  height: 100,
  padding: 16,
  border: 4,
  margin: 16,
};

describe("buildBoxModelCss", () => {
  it("emits one declaration per line", () => {
    expect(buildBoxModelCss(BASE)).toBe(
      ["width: 200px;", "height: 100px;", "padding: 16px;", "border: 4px solid;", "margin: 16px;"].join(
        "\n",
      ),
    );
  });

  it("coerces non-finite numbers to 0px", () => {
    expect(buildBoxModelCss({ ...BASE, width: Number.NaN, margin: Number.POSITIVE_INFINITY })).toBe(
      ["width: 0px;", "height: 100px;", "padding: 16px;", "border: 4px solid;", "margin: 0px;"].join(
        "\n",
      ),
    );
  });
});

describe("outerSize", () => {
  it("adds padding + border + margin on both sides", () => {
    // 200 + (16 + 4 + 16) * 2 = 272, 100 + 72 = 172
    expect(outerSize(BASE)).toEqual({ width: 272, height: 172 });
  });

  it("returns the content size when there is no surround", () => {
    expect(outerSize({ width: 50, height: 20, padding: 0, border: 0, margin: 0 })).toEqual({
      width: 50,
      height: 20,
    });
  });

  it("ignores non-finite surround values", () => {
    expect(outerSize({ ...BASE, padding: Number.NaN })).toEqual({ width: 240, height: 140 });
  });
});
