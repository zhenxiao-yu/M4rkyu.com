import { describe, it, expect } from "vitest";
import { countNotImported } from "@/lib/admin/import/not-imported";

describe("countNotImported", () => {
  it("counts static slugs missing from the DB", () => {
    expect(countNotImported(["a", "b", "c"], ["b"])).toBe(2);
  });
  it("is zero when everything is imported", () => {
    expect(countNotImported(["a", "b"], ["a", "b", "x"])).toBe(0);
  });
});
