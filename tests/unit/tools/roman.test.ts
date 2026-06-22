import { describe, expect, it } from "vitest";

import { fromRoman, toRoman, ROMAN_MIN, ROMAN_MAX } from "@/lib/tools/roman";

describe("toRoman", () => {
  it("converts representative values", () => {
    expect(toRoman(1)).toBe("I");
    expect(toRoman(4)).toBe("IV");
    expect(toRoman(9)).toBe("IX");
    expect(toRoman(40)).toBe("XL");
    expect(toRoman(90)).toBe("XC");
    expect(toRoman(2026)).toBe("MMXXVI");
    expect(toRoman(ROMAN_MAX)).toBe("MMMCMXCIX"); // 3999
  });

  it("returns null outside the classical 1–3999 range", () => {
    expect(toRoman(0)).toBeNull();
    expect(toRoman(ROMAN_MIN - 1)).toBeNull();
    expect(toRoman(4000)).toBeNull();
    expect(toRoman(-5)).toBeNull();
  });

  it("returns null for non-integers", () => {
    expect(toRoman(3.5)).toBeNull();
    expect(toRoman(Number.NaN)).toBeNull();
    expect(toRoman(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("fromRoman", () => {
  it("parses canonical numerals", () => {
    expect(fromRoman("I")).toBe(1);
    expect(fromRoman("IV")).toBe(4);
    expect(fromRoman("IX")).toBe(9);
    expect(fromRoman("MMXXVI")).toBe(2026);
    expect(fromRoman("MCMXCIV")).toBe(1994);
    expect(fromRoman("MMMCMXCIX")).toBe(3999);
  });

  it("trims whitespace and is case-insensitive", () => {
    expect(fromRoman("  iv  ")).toBe(4);
    expect(fromRoman("mcmxciv")).toBe(1994);
  });

  it("rejects non-canonical spellings", () => {
    expect(fromRoman("IIII")).toBeNull(); // should be IV
    expect(fromRoman("VV")).toBeNull(); // should be X
    expect(fromRoman("IC")).toBeNull(); // invalid subtractive
    expect(fromRoman("XM")).toBeNull(); // invalid subtractive
    expect(fromRoman("MMMM")).toBeNull(); // 4000, out of range
  });

  it("rejects empty and garbage input", () => {
    expect(fromRoman("")).toBeNull();
    expect(fromRoman("   ")).toBeNull();
    expect(fromRoman("hello")).toBeNull();
    expect(fromRoman("123")).toBeNull();
    expect(fromRoman("IVX!")).toBeNull();
  });

  it("round-trips every value in range", () => {
    for (let n = ROMAN_MIN; n <= ROMAN_MAX; n += 1) {
      const roman = toRoman(n);
      expect(roman).not.toBeNull();
      expect(fromRoman(roman as string)).toBe(n);
    }
  });
});
