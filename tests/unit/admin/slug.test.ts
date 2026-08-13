import { describe, expect, it } from "vitest";
import { copySlugLikePattern, nextCopySlug } from "@/lib/admin/slug";

describe("copySlugLikePattern", () => {
  it("builds a LIKE pattern for every copy of a base slug", () => {
    expect(copySlugLikePattern("nimbus")).toBe("nimbus-copy%");
  });
});

describe("nextCopySlug", () => {
  it("returns <base>-copy when nothing is taken", () => {
    expect(nextCopySlug("nimbus", [])).toBe("nimbus-copy");
  });

  it("skips to -2 when the plain copy exists", () => {
    expect(nextCopySlug("nimbus", ["nimbus-copy"])).toBe("nimbus-copy-2");
  });

  it("finds the first gap in a run of copies", () => {
    expect(
      nextCopySlug("nimbus", ["nimbus-copy", "nimbus-copy-2", "nimbus-copy-4"]),
    ).toBe("nimbus-copy-3");
  });

  it("ignores unrelated slugs in the taken set", () => {
    expect(nextCopySlug("nimbus", ["nimbus", "other-copy"])).toBe("nimbus-copy");
  });

  it("truncates candidates to maxLen", () => {
    const base = "a".repeat(80);
    const result = nextCopySlug(base, [], 80);
    expect(result.length).toBe(80);
    expect(result.startsWith("a")).toBe(true);
  });
});
