import { describe, expect, it } from "vitest";

import { bigIntFromBase, toBase, BASES } from "@/lib/tools/base-converter";

describe("bigIntFromBase", () => {
  it("parses each base", () => {
    expect(bigIntFromBase("1010", 2)).toBe(10n);
    expect(bigIntFromBase("12", 8)).toBe(10n);
    expect(bigIntFromBase("10", 10)).toBe(10n);
    expect(bigIntFromBase("a", 16)).toBe(10n);
  });

  it("is case-insensitive for hex digits", () => {
    expect(bigIntFromBase("FF", 16)).toBe(255n);
    expect(bigIntFromBase("ff", 16)).toBe(255n);
  });

  it("strips 0b / 0o / 0x prefixes (case-insensitive)", () => {
    expect(bigIntFromBase("0b1010", 2)).toBe(10n);
    expect(bigIntFromBase("0o12", 8)).toBe(10n);
    expect(bigIntFromBase("0xAF", 16)).toBe(175n);
    expect(bigIntFromBase("0X1F", 16)).toBe(31n);
  });

  it("ignores underscore group separators", () => {
    expect(bigIntFromBase("1010_1010", 2)).toBe(170n);
    expect(bigIntFromBase("1_000", 10)).toBe(1000n);
    expect(bigIntFromBase("0xDE_AD", 16)).toBe(0xdeadn);
  });

  it("trims surrounding whitespace", () => {
    expect(bigIntFromBase("  ff  ", 16)).toBe(255n);
  });

  it("returns null for a digit out of range for the base", () => {
    expect(bigIntFromBase("2", 2)).toBeNull(); // 2 invalid in binary
    expect(bigIntFromBase("8", 8)).toBeNull(); // 8 invalid in octal
    expect(bigIntFromBase("a", 10)).toBeNull(); // a invalid in decimal
    expect(bigIntFromBase("g", 16)).toBeNull(); // g invalid in hex
  });

  it("returns null for empty / whitespace-only / prefix-only input", () => {
    expect(bigIntFromBase("", 10)).toBeNull();
    expect(bigIntFromBase("   ", 10)).toBeNull();
    expect(bigIntFromBase("0x", 16)).toBeNull();
    expect(bigIntFromBase("____", 2)).toBeNull();
  });

  it("preserves precision for very large values (beyond Number.MAX_SAFE_INTEGER)", () => {
    const big = "9007199254740993"; // 2^53 + 1, not representable as a JS number
    const parsed = bigIntFromBase(big, 10);
    expect(parsed).toBe(9007199254740993n);
    expect(parsed).not.toBe(BigInt(Number(big))); // Number() would round to 2^53
  });
});

describe("toBase", () => {
  it("serializes a BigInt into each base", () => {
    expect(toBase(255n, 2)).toBe("11111111");
    expect(toBase(255n, 8)).toBe("377");
    expect(toBase(255n, 10)).toBe("255");
    expect(toBase(255n, 16)).toBe("ff");
  });

  it("round-trips through every base", () => {
    const value = 123456789012345678901234567890n;
    for (const base of BASES) {
      const text = toBase(value, base);
      expect(bigIntFromBase(text, base)).toBe(value);
    }
  });
});
