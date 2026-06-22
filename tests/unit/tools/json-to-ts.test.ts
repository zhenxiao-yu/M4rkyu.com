import { describe, expect, it } from "vitest";

import {
  isValidIdentifier,
  jsonToTs,
  sanitizeInterfaceName,
} from "@/lib/tools/json-to-ts";

/** Narrowing helper — fails loudly with the error code if `ok` is false. */
function output(json: string, name = "Root"): string {
  const result = jsonToTs(json, name);
  if (!result.ok) {
    throw new Error(`expected ok, got error: ${result.error}`);
  }
  return result.output;
}

describe("jsonToTs", () => {
  it("infers a flat object interface", () => {
    expect(output('{"id": 1, "title": "Hello", "draft": true}', "Post")).toBe(
      [
        "interface Post {",
        "  id: number;",
        "  title: string;",
        "  draft: boolean;",
        "}",
      ].join("\n"),
    );
  });

  it("infers nested objects", () => {
    expect(output('{"meta": {"draft": true}}')).toBe(
      [
        "interface Root {",
        "  meta: {",
        "    draft: boolean;",
        "  };",
        "}",
      ].join("\n"),
    );
  });

  it("merges an array of objects, marking partial keys optional", () => {
    const out = output('{"items": [{"a": 1}, {"a": 2, "b": "x"}]}');
    expect(out).toContain("items: {");
    expect(out).toContain("a: number;");
    expect(out).toContain("b?: string;");
    expect(out).toContain("}[];");
  });

  it("renders an empty array as unknown[]", () => {
    expect(output('{"tags": []}')).toContain("tags: unknown[];");
  });

  it("folds null into a nullable union", () => {
    const out = output('{"items": [1, null]}');
    expect(out).toContain("items: (number | null)[];");
  });

  it("makes a null-only field render as null", () => {
    expect(output('{"value": null}')).toContain("value: null;");
  });

  it("unions mixed-type arrays", () => {
    expect(output('{"mixed": [1, "two", true]}')).toContain(
      "mixed: (number | string | boolean)[];",
    );
  });

  it("emits a type alias for a non-object root array", () => {
    expect(output("[1, 2, 3]", "Nums")).toBe("type Nums = number[];");
  });

  it("returns a syntax error for malformed JSON instead of throwing", () => {
    const result = jsonToTs('{"id": 1,}', "Root");
    expect(result).toEqual({ ok: false, error: "syntax" });
  });

  it("returns an empty error for blank input", () => {
    expect(jsonToTs("   ", "Root")).toEqual({ ok: false, error: "empty" });
  });

  it("quotes object keys that are not valid identifiers", () => {
    expect(output('{"data-id": 1}')).toContain('"data-id": number;');
  });
});

describe("sanitizeInterfaceName", () => {
  it("keeps a valid identifier untouched", () => {
    expect(sanitizeInterfaceName("UserProfile")).toBe("UserProfile");
  });

  it("falls back to Root for empty input", () => {
    expect(sanitizeInterfaceName("")).toBe("Root");
    expect(sanitizeInterfaceName("   ")).toBe("Root");
  });

  it("pascal-joins separated words", () => {
    expect(sanitizeInterfaceName("user profile-card")).toBe("userProfileCard");
  });

  it("prefixes a leading-digit name so it stays a valid identifier", () => {
    expect(sanitizeInterfaceName("123")).toBe("_123");
  });

  it("strips invalid characters", () => {
    expect(sanitizeInterfaceName("My@Type!")).toBe("MyType");
  });
});

describe("isValidIdentifier", () => {
  it("accepts valid identifiers and rejects invalid ones", () => {
    expect(isValidIdentifier("Root")).toBe(true);
    expect(isValidIdentifier("_$x1")).toBe(true);
    expect(isValidIdentifier("1abc")).toBe(false);
    expect(isValidIdentifier("has space")).toBe(false);
    expect(isValidIdentifier("")).toBe(false);
  });
});
