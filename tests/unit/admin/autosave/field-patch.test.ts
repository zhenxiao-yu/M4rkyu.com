import { describe, it, expect } from "vitest";
import { buildGalleryItemPatch } from "@/lib/gallery/admin/field-patch";

describe("buildGalleryItemPatch", () => {
  it("keeps only allowlisted keys and maps to snake_case", () => {
    const patch = buildGalleryItemPatch({
      caption: "a sunset",
      capturedAt: "2024-08-01",
      featured: true,
      bogus: "x", // dropped
      id: "should-drop", // dropped
    });
    expect(patch).toEqual({ caption: "a sunset", captured_at: "2024-08-01", featured: true });
  });

  it("validates enums and arrays", () => {
    expect(buildGalleryItemPatch({ status: "ready" })).toEqual({ status: "ready" });
    expect(buildGalleryItemPatch({ tags: ["street", "bw"] })).toEqual({ tags: ["street", "bw"] });
    expect(() => buildGalleryItemPatch({ status: "nope" })).toThrow();
    expect(() => buildGalleryItemPatch({ aspect: "5/5" })).toThrow();
  });

  it("is empty-safe and ignores absent keys", () => {
    expect(buildGalleryItemPatch({})).toEqual({});
    expect(buildGalleryItemPatch({ pinned: false })).toEqual({ pinned: false });
  });
});
