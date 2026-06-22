import { describe, expect, it } from "vitest";

import {
  generateLorem,
  LOREM_MAX_PARAGRAPHS,
  LOREM_MAX_WORDS,
} from "@/lib/tools/lorem-ipsum";

/** Deterministic rng: a fixed mid value so word picks are stable across runs. */
const fixedRng = () => 0.42;

/** Walks 0, 0.1, 0.2,… so sentence/word lengths vary predictably. */
function sequentialRng(): () => number {
  let n = 0;
  return () => {
    const v = (n % 10) / 10;
    n += 1;
    return v;
  };
}

describe("generateLorem", () => {
  it("respects the requested paragraph count", () => {
    for (const count of [1, 3, 7]) {
      const out = generateLorem(
        { count, unit: "paragraphs", startWithLorem: false },
        sequentialRng(),
      );
      expect(out.split("\n\n")).toHaveLength(count);
    }
  });

  it("respects the requested word count", () => {
    for (const count of [1, 5, 25, 100]) {
      const out = generateLorem(
        { count, unit: "words", startWithLorem: false },
        fixedRng,
      );
      expect(out.split(" ")).toHaveLength(count);
    }
  });

  it("respects the requested sentence count", () => {
    const out = generateLorem(
      { count: 4, unit: "sentences", startWithLorem: false },
      sequentialRng(),
    );
    // Sentences end in a period; count the terminators.
    expect((out.match(/\./g) ?? []).length).toBe(4);
  });

  it("prefixes 'Lorem ipsum' when startWithLorem is set", () => {
    for (const unit of ["paragraphs", "sentences", "words"] as const) {
      const out = generateLorem(
        { count: 5, unit, startWithLorem: true },
        sequentialRng(),
      );
      expect(out.startsWith("Lorem ipsum")).toBe(true);
    }
  });

  it("does not force the Lorem prefix when startWithLorem is false", () => {
    // Deterministic rng -> stable first word; with the canonical opener off it
    // must not coincidentally be the opener for this seed.
    const out = generateLorem(
      { count: 6, unit: "words", startWithLorem: false },
      fixedRng,
    );
    expect(out.startsWith("Lorem ipsum dolor sit amet")).toBe(false);
  });

  it("clamps count up to at least 1", () => {
    for (const count of [0, -5, Number.NaN]) {
      const out = generateLorem(
        { count, unit: "paragraphs", startWithLorem: false },
        sequentialRng(),
      );
      expect(out.split("\n\n")).toHaveLength(1);
    }
  });

  it("clamps count down to the per-unit maximum", () => {
    const paras = generateLorem(
      { count: 9999, unit: "paragraphs", startWithLorem: false },
      sequentialRng(),
    );
    expect(paras.split("\n\n")).toHaveLength(LOREM_MAX_PARAGRAPHS);

    const words = generateLorem(
      { count: 9_999_999, unit: "words", startWithLorem: false },
      fixedRng,
    );
    expect(words.split(" ")).toHaveLength(LOREM_MAX_WORDS);
  });

  it("capitalizes the first word of word-mode output", () => {
    const out = generateLorem(
      { count: 3, unit: "words", startWithLorem: false },
      fixedRng,
    );
    expect(out.charAt(0)).toBe(out.charAt(0).toUpperCase());
  });

  it("is deterministic for a given rng", () => {
    const a = generateLorem(
      { count: 4, unit: "paragraphs", startWithLorem: true },
      sequentialRng(),
    );
    const b = generateLorem(
      { count: 4, unit: "paragraphs", startWithLorem: true },
      sequentialRng(),
    );
    expect(a).toBe(b);
  });
});
