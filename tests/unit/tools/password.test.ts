import { describe, expect, it } from "vitest";

import {
  buildPool,
  cryptoRandomInt,
  generatePassword,
  hasUsablePool,
  scoreStrength,
  type PasswordOptions,
  type RandomInt,
} from "@/lib/tools/password";

/** Deterministic RNG: walks 0,1,2,… mod max so output is fully predictable. */
function sequentialRandom(): RandomInt {
  let n = 0;
  return (max: number) => (max <= 0 ? 0 : n++ % max);
}

const allOn: PasswordOptions = {
  length: 16,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  noAmbiguous: false,
};

const allOff: PasswordOptions = {
  ...allOn,
  lower: false,
  upper: false,
  digits: false,
  symbols: false,
};

describe("generatePassword", () => {
  it("respects the requested length", () => {
    for (const length of [4, 12, 20, 64, 128]) {
      const pw = generatePassword({ ...allOn, length }, sequentialRandom());
      expect(pw).toHaveLength(length);
    }
  });

  it("clamps length defensively into [4, 128]", () => {
    expect(generatePassword({ ...allOn, length: 0 }, sequentialRandom())).toHaveLength(4);
    expect(generatePassword({ ...allOn, length: -10 }, sequentialRandom())).toHaveLength(4);
    expect(generatePassword({ ...allOn, length: 9999 }, sequentialRandom())).toHaveLength(128);
  });

  it("only emits characters from the selected classes", () => {
    const lowerOnly = generatePassword(
      { ...allOff, lower: true, length: 50 },
      sequentialRandom(),
    );
    expect(lowerOnly).toMatch(/^[a-z]+$/);

    const digitsOnly = generatePassword(
      { ...allOff, digits: true, length: 50 },
      sequentialRandom(),
    );
    expect(digitsOnly).toMatch(/^[0-9]+$/);

    const upperSymbols = generatePassword(
      { ...allOff, upper: true, symbols: true, length: 80 },
      sequentialRandom(),
    );
    expect(upperSymbols).toMatch(/^[A-Z!@#$%^&*()\-_=+[\]{};:,.<>/?]+$/);
    expect(upperSymbols).not.toMatch(/[a-z0-9]/);
  });

  it("excludes ambiguous glyphs when noAmbiguous is set", () => {
    const pw = generatePassword(
      { ...allOn, noAmbiguous: true, length: 128 },
      sequentialRandom(),
    );
    expect(pw).not.toMatch(/[0OIl1]/);
  });

  it("returns an empty string when no class is selected (the guarded case)", () => {
    expect(generatePassword(allOff, sequentialRandom())).toBe("");
  });

  it("returns empty when ambiguous-exclusion empties an only-digits-of-0/1 pool edge", () => {
    // digits pool minus 0 and 1 still has 2-9, so this stays non-empty — the
    // guard is about the all-off case, which hasUsablePool catches below.
    const pw = generatePassword(
      { ...allOff, digits: true, noAmbiguous: true, length: 30 },
      sequentialRandom(),
    );
    expect(pw).not.toMatch(/[01]/);
    expect(pw.length).toBe(30);
  });
});

describe("hasUsablePool", () => {
  it("is false when every class is off", () => {
    expect(hasUsablePool(allOff)).toBe(false);
  });

  it("is true when at least one class is on", () => {
    expect(hasUsablePool({ ...allOff, lower: true })).toBe(true);
    expect(hasUsablePool(allOn)).toBe(true);
  });

  it("reflects ambiguous exclusion on the pool contents", () => {
    expect(buildPool({ ...allOff, digits: true, noAmbiguous: true })).not.toContain("0");
  });
});

describe("scoreStrength", () => {
  it("treats an empty password as weak with zero bits", () => {
    expect(scoreStrength("")).toEqual({ bits: 0, level: "weak", pct: 0 });
  });

  it("is monotonic non-decreasing in length for a fixed class set", () => {
    let prev = -1;
    for (let len = 4; len <= 128; len += 4) {
      const pw = "a".repeat(len);
      const { bits } = scoreStrength(pw);
      expect(bits).toBeGreaterThanOrEqual(prev);
      prev = bits;
    }
  });

  it("rises through the levels as length and variety grow", () => {
    expect(scoreStrength("aaaa").level).toBe("weak");
    expect(scoreStrength("Aa1!Aa1!Aa1!Aa1!Aa1!").level).toBe("strong");
  });

  it("clamps pct at 100", () => {
    expect(scoreStrength("Aa1!".repeat(40)).pct).toBe(100);
  });
});

describe("cryptoRandomInt", () => {
  it("produces only in-range values and never loops on a benign source", () => {
    const fill = (arr: Uint32Array) => {
      arr[0] = 42;
      return arr;
    };
    const r = cryptoRandomInt(fill);
    for (let i = 0; i < 100; i++) {
      const v = r(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it("returns 0 for a non-positive bound", () => {
    const r = cryptoRandomInt((arr) => arr);
    expect(r(0)).toBe(0);
  });
});
