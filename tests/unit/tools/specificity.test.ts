import { describe, expect, it } from "vitest";
import {
  analyzeSelector,
  formatSpecificity,
  specificity,
} from "@/lib/tools/specificity";

describe("specificity", () => {
  it("scores an ID selector as (1, 0, 0)", () => {
    expect(specificity("#id")).toEqual({ a: 1, b: 0, c: 0 });
  });

  it("counts each class once", () => {
    expect(specificity(".a.b")).toEqual({ a: 0, b: 2, c: 0 });
  });

  it("scores descendant element selectors and ignores the combinator", () => {
    expect(specificity("div p")).toEqual({ a: 0, b: 0, c: 2 });
  });

  it("treats the universal selector as zero", () => {
    expect(specificity("*")).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("scores :where() as zero regardless of its argument", () => {
    expect(specificity(":where(#a.b div)")).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("takes the most specific argument of :is()", () => {
    expect(specificity(":is(.a, #b)")).toEqual({ a: 1, b: 0, c: 0 });
  });

  it("scores a pseudo-element in the element column", () => {
    expect(specificity("::before")).toEqual({ a: 0, b: 0, c: 1 });
  });

  it("scores an attribute selector in the class column", () => {
    expect(specificity('[type="text"]')).toEqual({ a: 0, b: 1, c: 0 });
  });

  it("returns (0, 0, 0) for empty input without throwing", () => {
    expect(specificity("")).toEqual({ a: 0, b: 0, c: 0 });
    expect(specificity("   ")).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("returns (0, 0, 0) for garbage input without throwing", () => {
    expect(() => specificity(">>> +++ ~~~")).not.toThrow();
    expect(specificity(">>> +++ ~~~")).toEqual({ a: 0, b: 0, c: 0 });
    expect(specificity("###")).toEqual({ a: 0, b: 0, c: 0 });
  });

  it("scores pseudo-classes in the class column", () => {
    expect(specificity("a:hover")).toEqual({ a: 0, b: 1, c: 1 });
  });

  it("treats single-colon legacy pseudo-elements as elements", () => {
    expect(specificity("p:before")).toEqual({ a: 0, b: 0, c: 2 });
  });

  it("takes the most specific argument of :not()", () => {
    expect(specificity("a:not(.btn, #x)")).toEqual({ a: 1, b: 0, c: 1 });
  });

  it("folds :has() into the host like :is()/:not()", () => {
    expect(specificity("section:has(> .child)")).toEqual({ a: 0, b: 1, c: 1 });
  });

  it("combines all three columns", () => {
    expect(specificity("#nav .item a:hover")).toEqual({ a: 1, b: 2, c: 1 });
  });

  it("returns the most specific entry of a comma-separated list", () => {
    expect(specificity(".a, #b, div")).toEqual({ a: 1, b: 0, c: 0 });
  });

  it("ignores all combinator types", () => {
    expect(specificity("div > p + a ~ span")).toEqual({ a: 0, b: 0, c: 4 });
  });

  it("does not count a bare # or . as a selector", () => {
    expect(specificity("# .")).toEqual({ a: 0, b: 0, c: 0 });
  });
});

describe("analyzeSelector", () => {
  it("returns no tokens for empty input", () => {
    expect(analyzeSelector("")).toEqual({
      score: { a: 0, b: 0, c: 0 },
      tokens: [],
    });
  });

  it("labels each token with its specificity column", () => {
    const { tokens } = analyzeSelector("#id .cls div ::before *");
    expect(tokens.map((t) => t.column)).toEqual([
      "a",
      "b",
      "c",
      "c",
      "zero",
    ]);
  });

  it("marks :where() as zero and :is() as functional", () => {
    const { tokens } = analyzeSelector(":where(.x) :is(.y)");
    expect(tokens.map((t) => t.column)).toEqual(["zero", "functional"]);
  });
});

describe("formatSpecificity", () => {
  it("formats the canonical triple", () => {
    expect(formatSpecificity({ a: 1, b: 2, c: 1 })).toBe("(1, 2, 1)");
  });
});
