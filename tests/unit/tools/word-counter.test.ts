import { describe, expect, it } from "vitest";

import { countText, readingMinutes } from "@/lib/tools/word-counter";

describe("countText", () => {
  it("returns all-zeros for empty input", () => {
    expect(countText("")).toEqual({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
    });
  });

  it("counts a plain ASCII sentence", () => {
    const r = countText("The quick brown fox.");
    expect(r.words).toBe(4);
    expect(r.characters).toBe(20);
    expect(r.charactersNoSpaces).toBe(17);
    expect(r.sentences).toBe(1);
    expect(r.paragraphs).toBe(1);
    expect(r.lines).toBe(1);
  });

  it("collapses multiple whitespace and trims trailing newline noise", () => {
    const r = countText("  hello    world  \n");
    expect(r.words).toBe(2);
    // Trailing "\n" splits into 2 lines but only 1 non-empty paragraph.
    expect(r.lines).toBe(2);
    expect(r.paragraphs).toBe(1);
  });

  it("counts CJK code points individually as words and characters", () => {
    const r = countText("你好世界");
    expect(r.characters).toBe(4);
    expect(r.charactersNoSpaces).toBe(4);
    expect(r.words).toBe(4);
  });

  it("handles mixed CJK + Latin (Hello 世界 = 3 words)", () => {
    const r = countText("Hello 世界");
    expect(r.words).toBe(3); // "Hello" + 世 + 界
    expect(r.characters).toBe(8); // H e l l o (space) 世 界
    expect(r.charactersNoSpaces).toBe(7);
  });

  it("counts emoji by code point, not UTF-16 unit", () => {
    // "😀" is two UTF-16 units but one code point.
    const r = countText("hi 😀");
    expect(r.characters).toBe(4); // h i (space) 😀
    expect(r.charactersNoSpaces).toBe(3);
    expect(r.words).toBe(2); // "hi" + the emoji as a non-CJK run
    // Sanity: native .length over-counts the emoji.
    expect("hi 😀".length).toBe(5);
  });

  it("counts multi-paragraph blocks separated by blank lines", () => {
    const text = "First para line one.\nStill first.\n\nSecond para here.";
    const r = countText(text);
    expect(r.paragraphs).toBe(2);
    expect(r.lines).toBe(4);
    expect(r.sentences).toBe(3);
  });

  it("counts a content run without a terminator as one sentence", () => {
    expect(countText("no terminator here").sentences).toBe(1);
  });

  it("ignores stray terminators that have no preceding content", () => {
    expect(countText("...").sentences).toBe(0);
    expect(countText("!!! ??? ...").sentences).toBe(0);
  });
});

describe("readingMinutes", () => {
  it("is 0 for no words", () => {
    expect(readingMinutes(0)).toBe(0);
  });

  it("floors to a 1-minute minimum for short text", () => {
    expect(readingMinutes(5)).toBe(1);
  });

  it("rounds up at the default 200 wpm", () => {
    expect(readingMinutes(201)).toBe(2);
    expect(readingMinutes(400)).toBe(2);
    expect(readingMinutes(401)).toBe(3);
  });
});
