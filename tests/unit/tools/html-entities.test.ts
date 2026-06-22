import { describe, expect, it } from "vitest";

import {
  decodeHtmlEntities,
  encodeHtmlEntities,
  runHtmlEntities,
} from "@/lib/tools/html-entities";

describe("encodeHtmlEntities", () => {
  it("escapes the five XML specials by name", () => {
    expect(encodeHtmlEntities(`<a href="x">y & 'z'</a>`, "named")).toBe(
      "&lt;a href=&quot;x&quot;&gt;y &amp; &#39;z&#39;&lt;/a&gt;",
    );
  });

  it("escapes the five specials numerically in numeric style", () => {
    expect(encodeHtmlEntities(`<&>"'`, "numeric")).toBe(
      "&#60;&#38;&#62;&#34;&#39;",
    );
  });

  it("leaves printable ASCII untouched", () => {
    expect(encodeHtmlEntities("Hello world 123", "named")).toBe("Hello world 123");
  });

  it("encodes non-ASCII as numeric refs in both styles", () => {
    expect(encodeHtmlEntities("café", "named")).toBe("caf&#233;");
    expect(encodeHtmlEntities("café", "numeric")).toBe("caf&#233;");
  });

  it("encodes emoji as a single code point, not split surrogates", () => {
    expect(encodeHtmlEntities("😀", "named")).toBe("&#128512;");
  });

  it("returns empty string for empty input", () => {
    expect(encodeHtmlEntities("", "named")).toBe("");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes named entities", () => {
    expect(decodeHtmlEntities("&lt;p&gt;a &amp; b&lt;/p&gt;")).toBe("<p>a & b</p>");
    expect(decodeHtmlEntities("&copy;&mdash;&hellip;")).toBe("©—…");
  });

  it("decodes decimal numeric references", () => {
    expect(decodeHtmlEntities("&#60;&#38;&#62;")).toBe("<&>");
    expect(decodeHtmlEntities("caf&#233;")).toBe("café");
  });

  it("decodes hex numeric references (lower and upper case)", () => {
    expect(decodeHtmlEntities("&#x3C;&#x26;&#X3E;")).toBe("<&>");
    expect(decodeHtmlEntities("&#x1F600;")).toBe("😀");
  });

  it("leaves unknown / malformed refs verbatim", () => {
    expect(decodeHtmlEntities("&notARealEntity;")).toBe("&notARealEntity;");
    expect(decodeHtmlEntities("&#xZZ;")).toBe("&#xZZ;");
    expect(decodeHtmlEntities("plain & text")).toBe("plain & text");
  });

  it("leaves out-of-range numeric refs verbatim rather than throwing", () => {
    expect(() => decodeHtmlEntities("&#9999999999;")).not.toThrow();
    expect(decodeHtmlEntities("&#9999999999;")).toBe("&#9999999999;");
  });

  it("never executes markup (no DOM) — script tags decode to text", () => {
    expect(decodeHtmlEntities("&lt;script&gt;")).toBe("<script>");
  });

  it("returns empty string for empty input", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });
});

describe("round-trip", () => {
  it("encode → decode restores the original (named)", () => {
    const original = `<p>Hello & welcome — code "M4rkyu" 😀</p>`;
    expect(decodeHtmlEntities(encodeHtmlEntities(original, "named"))).toBe(original);
  });

  it("encode → decode restores the original (numeric)", () => {
    const original = `<p>Hello & welcome — café 😀</p>`;
    expect(decodeHtmlEntities(encodeHtmlEntities(original, "numeric"))).toBe(original);
  });
});

describe("runHtmlEntities", () => {
  it("treats empty input as a valid empty state", () => {
    expect(runHtmlEntities("", "encode", "named")).toEqual({
      output: "",
      empty: true,
    });
  });

  it("encodes via the named style", () => {
    expect(runHtmlEntities("<b>", "encode", "named")).toEqual({
      output: "&lt;b&gt;",
      empty: false,
    });
  });

  it("decodes regardless of style argument", () => {
    expect(runHtmlEntities("&lt;b&gt;", "decode", "named")).toEqual({
      output: "<b>",
      empty: false,
    });
  });
});
