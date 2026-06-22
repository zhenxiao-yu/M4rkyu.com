import { describe, expect, it } from "vitest";

import {
  findMime,
  normalizeQuery,
  type MimeEntry,
} from "@/lib/tools/mime-finder";

const LIST: MimeEntry[] = [
  { ext: ".png", mime: "image/png", description: "PNG image" },
  { ext: ".jpg", mime: "image/jpeg", description: "JPEG image" },
  { ext: ".jpeg", mime: "image/jpeg", description: "JPEG image" },
  { ext: ".json", mime: "application/json", description: "JSON" },
  { ext: ".pdf", mime: "application/pdf", description: "PDF document" },
];

describe("normalizeQuery", () => {
  it("trims, lower-cases, and strips a leading dot", () => {
    expect(normalizeQuery("  .PNG  ")).toBe("png");
  });

  it("strips repeated leading dots only", () => {
    expect(normalizeQuery("...png")).toBe("png");
    expect(normalizeQuery("a.b")).toBe("a.b");
  });

  it("returns empty string for empty / whitespace / lone-dot input", () => {
    expect(normalizeQuery("")).toBe("");
    expect(normalizeQuery("   ")).toBe("");
    expect(normalizeQuery(".")).toBe("");
  });
});

describe("findMime", () => {
  it('resolves ".png" to image/png', () => {
    const hit = findMime(LIST, ".png");
    expect(hit).toHaveLength(1);
    expect(hit[0]?.mime).toBe("image/png");
  });

  it('resolves "png" (no dot) to image/png', () => {
    const hit = findMime(LIST, "png");
    expect(hit.map((e) => e.mime)).toEqual(["image/png"]);
  });

  it("is case-insensitive", () => {
    expect(findMime(LIST, ".PNG").map((e) => e.mime)).toEqual(["image/png"]);
    expect(findMime(LIST, "IMAGE/").map((e) => e.ext)).toEqual([
      ".png",
      ".jpg",
      ".jpeg",
    ]);
  });

  it("matches MIME substrings and descriptions", () => {
    expect(findMime(LIST, "application/").map((e) => e.ext)).toEqual([
      ".json",
      ".pdf",
    ]);
    expect(findMime(LIST, "document").map((e) => e.ext)).toEqual([".pdf"]);
  });

  it("returns an empty array for an unknown query", () => {
    expect(findMime(LIST, "nope")).toEqual([]);
    expect(findMime(LIST, ".xyz")).toEqual([]);
  });

  it("returns the full list (a copy) for empty / whitespace / lone-dot input", () => {
    expect(findMime(LIST, "")).toHaveLength(LIST.length);
    expect(findMime(LIST, "   ")).toHaveLength(LIST.length);
    expect(findMime(LIST, ".")).toHaveLength(LIST.length);
    expect(findMime(LIST, "")).not.toBe(LIST);
  });

  it("does not throw on regex-special / hostile input", () => {
    expect(() => findMime(LIST, "[(")).not.toThrow();
    expect(() => findMime(LIST, "*")).not.toThrow();
    expect(() => findMime(LIST, "\\")).not.toThrow();
    expect(findMime(LIST, "[(")).toEqual([]);
  });
});
