import { describe, expect, it } from "vitest";

import { rankCommand, searchDocs } from "@/lib/search/rank";
import type { SearchDoc } from "@/lib/search/catalog";

const doc = (over: Partial<SearchDoc> & { id: string }): SearchDoc => ({
  type: "note",
  title: "",
  description: "",
  href: "/x",
  ...over,
});

describe("rankCommand", () => {
  it("tiers prefix > word-boundary > substring > fuzzy > miss", () => {
    expect(rankCommand("React hooks", "react")).toBe(1); // prefix
    expect(rankCommand("Learn React", "react")).toBe(0.85); // word-boundary
    expect(rankCommand("preReactish", "react")).toBe(0.6); // substring
    expect(rankCommand("r-e-a-c-t", "react")).toBe(0.3); // fuzzy in-order
    expect(rankCommand("nextjs", "react")).toBe(0); // miss
  });

  it("treats an empty query as a match-all", () => {
    expect(rankCommand("anything", "  ")).toBe(1);
  });
});

describe("searchDocs", () => {
  const catalog: SearchDoc[] = [
    doc({ id: "a", title: "Nimbus", tags: ["weather"], description: "app" }),
    doc({ id: "b", title: "Other", tags: ["react", "css"], description: "x" }),
    doc({ id: "c", title: "Notes on weather systems", description: "y" }),
  ];

  it("returns the head unfiltered for an empty query", () => {
    expect(searchDocs(catalog, "").map((d) => d.id)).toEqual(["a", "b", "c"]);
  });

  it("matches across title and tags, ranked by score", () => {
    const ids = searchDocs(catalog, "weather").map((d) => d.id);
    // 'a' matches tag "weather" (prefix), 'c' matches title word-boundary.
    expect(ids).toContain("a");
    expect(ids).toContain("c");
    expect(ids).not.toContain("b");
  });

  it("finds tag-only matches", () => {
    expect(searchDocs(catalog, "react").map((d) => d.id)).toEqual(["b"]);
  });

  it("returns nothing for a miss", () => {
    expect(searchDocs(catalog, "zzz")).toHaveLength(0);
  });
});
