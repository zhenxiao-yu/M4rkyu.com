import { describe, it, expect } from "vitest";
import { partitionBySlug } from "@/lib/admin/import/types";

const slugOf = (x: { slug: string }) => x.slug;

describe("partitionBySlug", () => {
  it("keeps only slugs absent from the DB", () => {
    const items = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];
    const { toInsert, skippedSlugs } = partitionBySlug(items, new Set(["b"]), slugOf);
    expect(toInsert.map(slugOf)).toEqual(["a", "c"]);
    expect(skippedSlugs).toEqual(["b"]);
  });

  it("dedupes repeats within the same batch", () => {
    const items = [{ slug: "a" }, { slug: "a" }, { slug: "d" }];
    const { toInsert, skippedSlugs } = partitionBySlug(items, new Set(), slugOf);
    expect(toInsert.map(slugOf)).toEqual(["a", "d"]);
    expect(skippedSlugs).toEqual(["a"]);
  });

  it("is empty-safe", () => {
    expect(partitionBySlug([], new Set(), slugOf)).toEqual({ toInsert: [], skippedSlugs: [] });
  });
});
