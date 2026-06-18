import { describe, expect, it } from "vitest";

import { extractMarkdownHeadings } from "@/lib/blog/headings";

describe("extractMarkdownHeadings", () => {
  it("extracts h2 and h3 headings only", () => {
    expect(
      extractMarkdownHeadings(
        ["# Title", "## Overview", "### Details", "#### Too deep"].join("\n"),
      ),
    ).toEqual([
      { id: "overview", text: "Overview", depth: 2 },
      { id: "details", text: "Details", depth: 3 },
    ]);
  });

  it("ignores heading-looking lines inside fenced code", () => {
    expect(
      extractMarkdownHeadings(
        [
          "```ts",
          "## Not a heading",
          "```",
          "## Real heading",
          "~~~",
          "### Also ignored",
          "~~~",
        ].join("\n"),
      ),
    ).toEqual([{ id: "real-heading", text: "Real heading", depth: 2 }]);
  });

  it("strips inline markdown from labels", () => {
    expect(
      extractMarkdownHeadings(
        "## **Build** [fast](https://example.com) with `Next` ###",
      ),
    ).toEqual([
      {
        id: "build-fast-with-next",
        text: "Build fast with Next",
        depth: 2,
      },
    ]);
  });

  it("deduplicates ids in document order", () => {
    expect(
      extractMarkdownHeadings(["## Intro", "### Intro", "## Intro"].join("\n")),
    ).toEqual([
      { id: "intro", text: "Intro", depth: 2 },
      { id: "intro-2", text: "Intro", depth: 3 },
      { id: "intro-3", text: "Intro", depth: 2 },
    ]);
  });
});
