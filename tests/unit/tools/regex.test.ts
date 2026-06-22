import { describe, expect, it } from "vitest";

import { runRegex } from "@/lib/tools/regex";

describe("runRegex", () => {
  it("treats an empty pattern as a valid no-match state", () => {
    expect(runRegex("", "g", "anything")).toEqual({ ok: true, matches: [] });
  });

  it("collects every global match with captured groups", () => {
    const r = runRegex("(\\w+)@(\\w+)", "g", "a@b and c@d");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.matches).toEqual([
      { index: 0, value: "a@b", groups: ["a", "b"] },
      { index: 8, value: "c@d", groups: ["c", "d"] },
    ]);
  });

  it("returns a single match for a non-global pattern", () => {
    const r = runRegex("\\d+", "", "x12y34");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.matches).toEqual([{ index: 1, value: "12", groups: [] }]);
  });

  it("returns a typed error (not a throw) for an invalid pattern", () => {
    expect(() => runRegex("(", "g", "abc")).not.toThrow();
    const r = runRegex("(", "g", "abc");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(typeof r.error).toBe("string");
    expect(r.error.length).toBeGreaterThan(0);
  });

  it("returns a typed error for an invalid flag", () => {
    const r = runRegex("a", "z", "abc");
    expect(r.ok).toBe(false);
  });

  it("does not infinite-loop on a zero-width global pattern", () => {
    const r = runRegex("(?:)", "g", "ab");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Empty matches at every position, including end-of-string: 3 for "ab".
    expect(r.matches).toHaveLength(3);
    expect(r.matches.map((m) => m.index)).toEqual([0, 1, 2]);
  });

  it("makes forward progress on a sometimes-zero-width global pattern", () => {
    const r = runRegex("a*", "g", "baa");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // "" at 0, "aa" at 1, "" at 3 — no repeat-spin on the empty matches.
    expect(r.matches.map((m) => m.value)).toEqual(["", "aa", ""]);
  });
});
