import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/tools/color";
import { gradeContrast } from "@/lib/tools/contrast";

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

describe("gradeContrast", () => {
  it("black on white (21:1) passes every level", () => {
    const grades = gradeContrast(contrastRatio(BLACK, WHITE));
    expect(grades).toEqual({
      aaNormal: true,
      aaaNormal: true,
      aaLarge: true,
      aaaLarge: true,
    });
  });

  it("identical colors (1:1) fail every level", () => {
    const grades = gradeContrast(contrastRatio(BLACK, BLACK));
    expect(grades).toEqual({
      aaNormal: false,
      aaaNormal: false,
      aaLarge: false,
      aaaLarge: false,
    });
  });

  it("mid-gray on white sits between the bands", () => {
    // #767676 on white ≈ 4.54:1 — passes AA normal + both large, fails AAA normal.
    const grades = gradeContrast(contrastRatio({ r: 118, g: 118, b: 118 }, WHITE));
    expect(grades.aaNormal).toBe(true);
    expect(grades.aaaNormal).toBe(false);
    expect(grades.aaLarge).toBe(true);
    expect(grades.aaaLarge).toBe(true);
  });

  it("light gray on white fails large text too", () => {
    // #aaaaaa on white ≈ 2.32:1 — below every threshold including AA large (3).
    const grades = gradeContrast(contrastRatio({ r: 170, g: 170, b: 170 }, WHITE));
    expect(grades.aaNormal).toBe(false);
    expect(grades.aaaNormal).toBe(false);
    expect(grades.aaLarge).toBe(false);
    expect(grades.aaaLarge).toBe(false);
  });

  it("respects exact threshold boundaries", () => {
    expect(gradeContrast(4.5)).toMatchObject({ aaNormal: true, aaaLarge: true });
    expect(gradeContrast(4.49)).toMatchObject({ aaNormal: false, aaaLarge: false });
    expect(gradeContrast(7)).toMatchObject({ aaaNormal: true });
    expect(gradeContrast(3)).toMatchObject({ aaLarge: true });
    expect(gradeContrast(2.99)).toMatchObject({ aaLarge: false });
  });
});
