import { describe, expect, it } from "vitest";
import {
  buildBorderRadius,
  buildBorderRadiusCss,
} from "@/lib/tools/border-radius";

describe("buildBorderRadius", () => {
  it("collapses four equal corners to a single value", () => {
    expect(buildBorderRadius({ tl: 24, tr: 24, br: 24, bl: 24 })).toBe("24px");
  });

  it("collapses to two values when tl=br and tr=bl", () => {
    expect(buildBorderRadius({ tl: 12, tr: 24, br: 12, bl: 24 })).toBe(
      "12px 24px",
    );
  });

  it("collapses to three values when only tr=bl", () => {
    expect(buildBorderRadius({ tl: 8, tr: 16, br: 24, bl: 16 })).toBe(
      "8px 16px 24px",
    );
  });

  it("emits four values when all corners differ", () => {
    expect(buildBorderRadius({ tl: 8, tr: 16, br: 24, bl: 32 })).toBe(
      "8px 16px 24px 32px",
    );
  });

  it("honors the percent unit", () => {
    expect(buildBorderRadius({ tl: 50, tr: 50, br: 50, bl: 50 }, "%")).toBe(
      "50%",
    );
  });

  it("coerces non-finite numbers to 0", () => {
    expect(
      buildBorderRadius({
        tl: Number.NaN,
        tr: Number.POSITIVE_INFINITY,
        br: Number.NEGATIVE_INFINITY,
        bl: Number.NaN,
      }),
    ).toBe("0px");
  });

  it("does not over-collapse a value that only matches in one axis", () => {
    expect(buildBorderRadius({ tl: 10, tr: 20, br: 30, bl: 40 })).toBe(
      "10px 20px 30px 40px",
    );
  });
});

describe("buildBorderRadiusCss", () => {
  it("wraps the shorthand in a full declaration", () => {
    expect(buildBorderRadiusCss({ tl: 24, tr: 24, br: 24, bl: 24 })).toBe(
      "border-radius: 24px;",
    );
  });

  it("passes the unit through", () => {
    expect(
      buildBorderRadiusCss({ tl: 50, tr: 50, br: 50, bl: 50 }, "%"),
    ).toBe("border-radius: 50%;");
  });
});
