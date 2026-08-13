import { describe, expect, it } from "vitest";
import {
  arrayField,
  booleanField,
  pickField,
} from "@/lib/admin/form-parsing";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

describe("pickField", () => {
  it("returns the string value of a field", () => {
    expect(pickField(fd({ slug: "hello" }), "slug")).toBe("hello");
  });

  it("returns an empty string for an absent field", () => {
    expect(pickField(fd({}), "missing")).toBe("");
  });

  it("returns an empty string for a non-string (File) value", () => {
    const f = new FormData();
    f.set("image", new File(["x"], "x.png", { type: "image/png" }));
    expect(pickField(f, "image")).toBe("");
  });
});

describe("booleanField", () => {
  it("is true for the checkbox 'on' value", () => {
    expect(booleanField(fd({ featured: "on" }), "featured")).toBe(true);
  });

  it("is true for the literal 'true'", () => {
    expect(booleanField(fd({ featured: "true" }), "featured")).toBe(true);
  });

  it("is false for anything else, including absent", () => {
    expect(booleanField(fd({ featured: "off" }), "featured")).toBe(false);
    expect(booleanField(fd({ featured: "1" }), "featured")).toBe(false);
    expect(booleanField(fd({}), "featured")).toBe(false);
  });
});

describe("arrayField", () => {
  it("splits on newlines, trims, and drops empty lines", () => {
    expect(arrayField(fd({ tags: "  a \n b\n\n c \n" }), "tags")).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("handles CRLF line endings", () => {
    expect(arrayField(fd({ tags: "a\r\nb" }), "tags")).toEqual(["a", "b"]);
  });

  it("returns an empty array for an absent or blank field", () => {
    expect(arrayField(fd({}), "tags")).toEqual([]);
    expect(arrayField(fd({ tags: "   \n  " }), "tags")).toEqual([]);
  });
});
