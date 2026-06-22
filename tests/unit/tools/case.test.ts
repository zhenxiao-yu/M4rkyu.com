import { describe, expect, it } from "vitest";

import {
  CASE_KEYS,
  capitalize,
  convertAll,
  splitWords,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toLower,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUpper,
} from "@/lib/tools/case";

// A single mixed fixture: case boundaries, digits glued to letters, runs of
// spaces, mixed punctuation/separators, and leading/trailing noise.
const MIXED = "  Hello_world-fooBar  baz2qux . HTTP/2  ";

describe("splitWords", () => {
  it("returns [] for empty input", () => {
    expect(splitWords("")).toEqual([]);
  });

  it("returns [] for separators-only input", () => {
    expect(splitWords("  __ -- // .. \\ ")).toEqual([]);
  });

  it("splits on case boundaries, separators, and runs of whitespace", () => {
    expect(splitWords(MIXED)).toEqual([
      "Hello",
      "world",
      "foo",
      "Bar",
      "baz2qux",
      "HTTP",
      "2",
    ]);
  });

  it("keeps digit→letter glued but splits letter→Upper", () => {
    expect(splitWords("v4Tailwind")).toEqual(["v4", "Tailwind"]);
  });

  it("preserves unicode letters (accented Latin + CJK)", () => {
    expect(splitWords("café au lait")).toEqual(["café", "au", "lait"]);
    expect(splitWords("你好 world")).toEqual(["你好", "world"]);
  });
});

describe("capitalize", () => {
  it("is total on empty input", () => {
    expect(capitalize("")).toBe("");
  });

  it("uppercases first char and lowercases the rest", () => {
    expect(capitalize("hELLO")).toBe("Hello");
  });
});

describe("case transforms — mixed fixture", () => {
  it("camelCase", () => {
    expect(toCamelCase(MIXED)).toBe("helloWorldFooBarBaz2quxHttp2");
  });

  it("PascalCase", () => {
    expect(toPascalCase(MIXED)).toBe("HelloWorldFooBarBaz2quxHttp2");
  });

  it("snake_case", () => {
    expect(toSnakeCase(MIXED)).toBe("hello_world_foo_bar_baz2qux_http_2");
  });

  it("kebab-case", () => {
    expect(toKebabCase(MIXED)).toBe("hello-world-foo-bar-baz2qux-http-2");
  });

  it("CONSTANT_CASE", () => {
    expect(toConstantCase(MIXED)).toBe("HELLO_WORLD_FOO_BAR_BAZ2QUX_HTTP_2");
  });

  it("Title Case", () => {
    expect(toTitleCase(MIXED)).toBe("Hello World Foo Bar Baz2qux Http 2");
  });

  it("Sentence case", () => {
    expect(toSentenceCase(MIXED)).toBe("Hello world foo bar baz2qux http 2");
  });

  it("UPPERCASE preserves original spacing/punctuation", () => {
    expect(toUpper(MIXED)).toBe(MIXED.toLocaleUpperCase());
  });

  it("lowercase preserves original spacing/punctuation", () => {
    expect(toLower(MIXED)).toBe(MIXED.toLocaleLowerCase());
  });
});

describe("case transforms — empty input never throws", () => {
  for (const fn of [
    toCamelCase,
    toPascalCase,
    toSnakeCase,
    toKebabCase,
    toConstantCase,
    toTitleCase,
    toSentenceCase,
    toUpper,
    toLower,
  ]) {
    it(`${fn.name}("") === ""`, () => {
      expect(() => fn("")).not.toThrow();
      expect(fn("")).toBe("");
    });
  }
});

describe("case transforms — unicode", () => {
  it("camelCase keeps accented Latin", () => {
    expect(toCamelCase("café au lait")).toBe("caféAuLait");
  });

  it("snake_case lowercases accented Latin", () => {
    expect(toSnakeCase("Café Crème")).toBe("café_crème");
  });

  it("CONSTANT_CASE uppercases accented Latin", () => {
    expect(toConstantCase("café crème")).toBe("CAFÉ_CRÈME");
  });

  it("handles CJK as single words (no spurious case boundaries)", () => {
    expect(toSnakeCase("你好 世界")).toBe("你好_世界");
    expect(toTitleCase("你好 世界")).toBe("你好 世界");
  });
});

describe("convertAll", () => {
  it("flags empty input as empty (valid, not an error)", () => {
    const r = convertAll("");
    expect(r.empty).toBe(true);
    expect(r.results.map((x) => x.value)).toEqual(["", "", "", "", "", "", "", "", ""]);
  });

  it("flags separators-only input as empty", () => {
    expect(convertAll("  __ -- ").empty).toBe(true);
  });

  it("returns one result per key, in CASE_KEYS order, for real input", () => {
    const r = convertAll("hello world");
    expect(r.empty).toBe(false);
    expect(r.results.map((x) => x.key)).toEqual([...CASE_KEYS]);
  });

  it("never throws on hostile input", () => {
    expect(() => convertAll("\\\\///___---...  ")).not.toThrow();
    expect(() => convertAll("😀 emoji 数字123")).not.toThrow();
  });
});
