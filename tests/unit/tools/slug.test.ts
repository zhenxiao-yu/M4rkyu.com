import { describe, expect, it } from "vitest";

import { runSlug, slugify } from "@/lib/tools/slug";

describe("slugify", () => {
  it("treats empty / whitespace-only input as an empty slug, never an error", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(runSlug("")).toEqual({ slug: "", empty: true });
  });

  it("lowercases and joins words with a hyphen by default", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("folds diacritics via NFKD (Café → cafe)", () => {
    expect(slugify("Café")).toBe("cafe");
    expect(slugify("naïve Crème Brûlée")).toBe("naive-creme-brulee");
  });

  it("drops emoji and other symbols", () => {
    expect(slugify("hello 🌏 world 🚀")).toBe("hello-world");
    expect(slugify("🔥🔥🔥")).toBe("");
  });

  it("collapses runs of spaces and punctuation into a single separator", () => {
    expect(slugify("a   b---c___d")).toBe("a-b-c-d");
    expect(slugify("Building React Things — 2026 edition")).toBe(
      "building-react-things-2026-edition",
    );
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --hello--  ")).toBe("hello");
    expect(slugify("...dot leading and trailing...")).toBe("dot-leading-and-trailing");
  });

  it("keeps apostrophes from splitting words", () => {
    expect(slugify("it's a trap")).toBe("its-a-trap");
    expect(slugify("don’t panic")).toBe("dont-panic");
  });

  it("honors the underscore separator option", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
    expect(slugify("a - b", { separator: "_" })).toBe("a_b");
  });

  it("honors the lowercase: false option (preserves case)", () => {
    expect(slugify("Hello World", { lowercase: false })).toBe("Hello-World");
    expect(slugify("Café", { lowercase: false })).toBe("Cafe");
  });

  it("preserves CJK characters instead of producing an empty slug", () => {
    expect(slugify("你好 世界")).toBe("你好-世界");
    expect(slugify("こんにちは 世界")).toBe("こんにちは-世界");
    // Hangul syllables decompose into conjoining jamo under NFKD, so the slug
    // is NFD-normalized — compare against the normalized form, not the
    // precomposed literal (both render identically but differ by codepoint).
    expect(slugify("한국어 텍스트")).toBe("한국어-텍스트".normalize("NFKD"));
  });

  it("mixes ASCII through the primary pass even when CJK is present", () => {
    // ASCII pass succeeds (yields a non-empty slug), so CJK is dropped here —
    // the unicode fallback only fires when the ASCII pass is empty.
    expect(slugify("React 你好 World")).toBe("react-world");
  });

  it("reports empty: false for real content", () => {
    expect(runSlug("Hello World")).toEqual({ slug: "hello-world", empty: false });
    expect(runSlug("你好")).toEqual({ slug: "你好", empty: false });
  });
});
