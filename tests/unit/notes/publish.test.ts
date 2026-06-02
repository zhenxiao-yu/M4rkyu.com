import { describe, expect, it } from "vitest";

import { isPublishedNote } from "@/lib/notes/publish";

const NOW = Date.parse("2026-06-01T12:00:00.000Z");

describe("isPublishedNote", () => {
  it("shows a ready note dated in the past", () => {
    expect(
      isPublishedNote({ status: "ready", publishedAt: "2026-05-01" }, NOW),
    ).toBe(true);
  });

  it("hides a ready note scheduled in the future", () => {
    expect(
      isPublishedNote({ status: "ready", publishedAt: "2026-07-01" }, NOW),
    ).toBe(false);
  });

  it("hides non-ready notes regardless of date", () => {
    expect(
      isPublishedNote({ status: "draft", publishedAt: "2020-01-01" }, NOW),
    ).toBe(false);
    expect(
      isPublishedNote({ status: "coming-soon", publishedAt: "2020-01-01" }, NOW),
    ).toBe(false);
  });

  it("treats a date equal to now as published", () => {
    expect(
      isPublishedNote(
        { status: "ready", publishedAt: "2026-06-01T12:00:00.000Z" },
        NOW,
      ),
    ).toBe(true);
  });

  it("fails open on an unparseable date (a typo never buries a ready note)", () => {
    expect(
      isPublishedNote({ status: "ready", publishedAt: "not-a-date" }, NOW),
    ).toBe(true);
  });
});
