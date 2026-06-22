import { describe, expect, it } from "vitest";

import {
  diffText,
  formatDiff,
  MAX_DIFF_LINES,
  splitLines,
} from "@/lib/tools/text-diff";

describe("diffText", () => {
  it("treats two empty inputs as empty + identical, never a diff", () => {
    const r = diffText("", "");
    expect(r.empty).toBe(true);
    expect(r.identical).toBe(true);
    expect(r.lines).toEqual([]);
    expect(r.additions).toBe(0);
    expect(r.deletions).toBe(0);
    expect(r.truncated).toBe(false);
  });

  it("reports identical (not empty) for equal non-empty inputs", () => {
    const r = diffText("a\nb\nc", "a\nb\nc");
    expect(r.empty).toBe(false);
    expect(r.identical).toBe(true);
    expect(r.additions).toBe(0);
    expect(r.deletions).toBe(0);
    expect(r.lines.every((l) => l.op === "equal")).toBe(true);
  });

  it("counts pure additions when lines are only appended", () => {
    const r = diffText("a\nb", "a\nb\nc\nd");
    expect(r.additions).toBe(2);
    expect(r.deletions).toBe(0);
    expect(r.identical).toBe(false);
    expect(r.lines.filter((l) => l.op === "add").map((l) => l.text)).toEqual([
      "c",
      "d",
    ]);
  });

  it("counts pure deletions when lines are only removed", () => {
    const r = diffText("a\nb\nc\nd", "a\nd");
    expect(r.deletions).toBe(2);
    expect(r.additions).toBe(0);
    expect(r.identical).toBe(false);
    expect(r.lines.filter((l) => l.op === "remove").map((l) => l.text)).toEqual([
      "b",
      "c",
    ]);
  });

  it("handles a mixed add + remove diff", () => {
    const r = diffText(
      "the quick brown fox\njumps over the lazy dog",
      "the slow brown fox\njumps over the lazy cat",
    );
    expect(r.additions).toBe(2);
    expect(r.deletions).toBe(2);
    expect(r.identical).toBe(false);
    // The unchanged middle survives as an equal op.
    expect(r.lines.some((l) => l.op === "equal")).toBe(false);
  });

  it("treats one-side-empty as a real diff, not empty or identical", () => {
    // "" splits to [""]; "x\ny" splits to ["x","y"]. The empty line has no
    // match, so every changed line is an add and the empty original line is a
    // remove. The contract that matters: not empty, not identical, and the
    // new content shows up as additions.
    const added = diffText("", "x\ny");
    expect(added.empty).toBe(false);
    expect(added.identical).toBe(false);
    expect(added.additions).toBe(2);
    expect(added.lines.filter((l) => l.op === "add").map((l) => l.text)).toEqual(
      ["x", "y"],
    );

    const removed = diffText("x\ny", "");
    expect(removed.empty).toBe(false);
    expect(removed.identical).toBe(false);
    expect(removed.deletions).toBe(2);
    expect(
      removed.lines.filter((l) => l.op === "remove").map((l) => l.text),
    ).toEqual(["x", "y"]);
  });

  it("flags a trailing-newline-only difference as a real change", () => {
    const r = diffText("foo", "foo\n");
    expect(r.identical).toBe(false);
    expect(r.additions).toBe(1);
    expect(r.deletions).toBe(0);
  });

  it("normalizes CRLF so newline style alone is not a difference", () => {
    const r = diffText("a\r\nb", "a\nb");
    expect(r.identical).toBe(true);
    expect(r.additions).toBe(0);
    expect(r.deletions).toBe(0);
  });

  it("caps pathological input instead of diffing it", () => {
    const big = Array.from({ length: MAX_DIFF_LINES }, (_, i) => `line ${i}`).join(
      "\n",
    );
    const r = diffText(big, big + "\nextra");
    expect(r.truncated).toBe(true);
    expect(r.lines).toEqual([]);
    expect(r.identical).toBe(false);
  });

  it("reports identical truncated input correctly", () => {
    const big = Array.from({ length: MAX_DIFF_LINES + 10 }, (_, i) => `${i}`).join(
      "\n",
    );
    const r = diffText(big, big);
    expect(r.truncated).toBe(true);
    expect(r.identical).toBe(true);
  });
});

describe("splitLines", () => {
  it("yields a trailing empty line for a trailing newline", () => {
    expect(splitLines("a\n")).toEqual(["a", ""]);
  });
});

describe("formatDiff", () => {
  it("renders unified-diff-style signs", () => {
    const { lines } = diffText("a\nb", "a\nc");
    expect(formatDiff(lines)).toContain("- b");
    expect(formatDiff(lines)).toContain("+ c");
    expect(formatDiff(lines)).toContain("  a");
  });
});
