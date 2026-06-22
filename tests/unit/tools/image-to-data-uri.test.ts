import { describe, expect, it } from "vitest";

import { buildSnippets, dataUriMimeType } from "@/lib/tools/image-to-data-uri";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

describe("dataUriMimeType", () => {
  it("extracts the MIME type from a base64 data URI", () => {
    expect(dataUriMimeType(PNG)).toBe("image/png");
    expect(dataUriMimeType("data:image/svg+xml;base64,PHN2Zy8+")).toBe(
      "image/svg+xml",
    );
  });

  it("extracts the MIME type from a non-base64 (charset) data URI", () => {
    expect(dataUriMimeType("data:image/svg+xml,%3Csvg%2F%3E")).toBe(
      "image/svg+xml",
    );
  });

  it("returns null for strings that aren't data URIs", () => {
    expect(dataUriMimeType("")).toBeNull();
    expect(dataUriMimeType("https://example.com/a.png")).toBeNull();
    expect(dataUriMimeType("data:")).toBeNull();
  });
});

describe("buildSnippets", () => {
  it("builds an <img> tag and a CSS background rule from a data URI", () => {
    const { imgTag, cssBackground } = buildSnippets(PNG);
    expect(imgTag).toBe(`<img src="${PNG}" alt="" />`);
    expect(cssBackground).toBe(`background-image: url("${PNG}");`);
  });

  it("strips literal double quotes so the snippets stay syntactically valid", () => {
    const { imgTag, cssBackground } = buildSnippets('data:image/png;base64,A"B');
    expect(imgTag).toBe(`<img src="data:image/png;base64,AB" alt="" />`);
    expect(cssBackground).toBe(`background-image: url("data:image/png;base64,AB");`);
  });

  it("never throws on empty input", () => {
    expect(() => buildSnippets("")).not.toThrow();
    expect(buildSnippets("").imgTag).toBe(`<img src="" alt="" />`);
  });
});
