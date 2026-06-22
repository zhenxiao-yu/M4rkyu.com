import { describe, expect, it } from "vitest";

import { csvToJson, jsonToCsv, parseCsv } from "@/lib/tools/csv-json";

describe("csvToJson", () => {
  it("treats empty / whitespace input as a valid empty state, never an error", () => {
    expect(csvToJson("")).toEqual({ ok: true, output: "", empty: true });
    expect(csvToJson("   \n  ")).toEqual({ ok: true, output: "", empty: true });
  });

  it("parses a basic header + rows into objects", () => {
    const r = csvToJson("name,role\nMark,engineer\nZhen,designer");
    expect(r).toEqual({
      ok: true,
      empty: false,
      output: JSON.stringify(
        [
          { name: "Mark", role: "engineer" },
          { name: "Zhen", role: "designer" },
        ],
        null,
        2,
      ),
    });
  });

  it("handles a quoted field containing a comma", () => {
    const r = csvToJson('name,note\nMark,"hello, world"');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(JSON.parse(r.output)).toEqual([{ name: "Mark", note: "hello, world" }]);
  });

  it("unescapes doubled quotes inside a quoted field", () => {
    const r = csvToJson('q\n"she said ""hi"""');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(JSON.parse(r.output)).toEqual([{ q: 'she said "hi"' }]);
  });

  it("handles a newline embedded in a quoted field", () => {
    const r = csvToJson('a,b\n"line1\nline2",x');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(JSON.parse(r.output)).toEqual([{ a: "line1\nline2", b: "x" }]);
  });

  it("handles CRLF line endings and a trailing newline", () => {
    const r = csvToJson("a,b\r\n1,2\r\n3,4\r\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(JSON.parse(r.output)).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("pads ragged rows (missing trailing cells become empty strings)", () => {
    const r = csvToJson("a,b,c\n1,2\n4,5,6,7");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // Extra cells beyond the header are dropped; missing ones fill with "".
    expect(JSON.parse(r.output)).toEqual([
      { a: "1", b: "2", c: "" },
      { a: "4", b: "5", c: "6" },
    ]);
  });

  it("ignores blank separator lines", () => {
    const r = csvToJson("a,b\n1,2\n\n3,4\n");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(JSON.parse(r.output)).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("returns an empty array when only a header is present", () => {
    expect(csvToJson("a,b,c")).toEqual({ ok: true, output: "[]", empty: false });
  });
});

describe("parseCsv", () => {
  it("keeps an empty trailing field from a trailing comma", () => {
    expect(parseCsv("a,b,")).toEqual([["a", "b", ""]]);
  });
});

describe("jsonToCsv", () => {
  it("treats empty / whitespace input as a valid empty state", () => {
    expect(jsonToCsv("")).toEqual({ ok: true, output: "", empty: true });
    expect(jsonToCsv("  \n ")).toEqual({ ok: true, output: "", empty: true });
  });

  it("returns a typed error for non-array JSON (object)", () => {
    expect(() => jsonToCsv('{"a":1}')).not.toThrow();
    expect(jsonToCsv('{"a":1}')).toEqual({ ok: false, reason: "non-array" });
  });

  it("returns a typed error for non-array JSON (scalar)", () => {
    expect(jsonToCsv("42")).toEqual({ ok: false, reason: "non-array" });
    expect(jsonToCsv('"hi"')).toEqual({ ok: false, reason: "non-array" });
  });

  it("returns a typed error for malformed JSON, never throws", () => {
    expect(() => jsonToCsv("{not json")).not.toThrow();
    expect(jsonToCsv("{not json")).toEqual({ ok: false, reason: "malformed-json" });
  });

  it("emits empty output for an empty array", () => {
    expect(jsonToCsv("[]")).toEqual({ ok: true, output: "", empty: false });
  });

  it("unions keys across objects with missing keys (first-seen order)", () => {
    const json = JSON.stringify([
      { a: 1, b: 2 },
      { b: 3, c: 4 },
    ]);
    expect(jsonToCsv(json)).toEqual({
      ok: true,
      empty: false,
      output: "a,b,c\n1,2,\n,3,4",
    });
  });

  it("stringifies nested object/array values into a cell", () => {
    const json = JSON.stringify([{ id: 1, meta: { draft: true }, tags: ["x", "y"] }]);
    const r = jsonToCsv(json);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.output).toBe('id,meta,tags\n1,"{""draft"":true}","[""x"",""y""]"');
  });

  it("escapes commas, quotes, and newlines in values", () => {
    const json = JSON.stringify([{ note: 'a, "b"\nc' }]);
    const r = jsonToCsv(json);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.output).toBe('note\n"a, ""b""\nc"');
  });

  it("renders scalar array elements under a synthetic value column", () => {
    expect(jsonToCsv('[1,"two",true]')).toEqual({
      ok: true,
      empty: false,
      output: "value\n1\ntwo\ntrue",
    });
  });

  it("treats null/undefined fields as empty cells", () => {
    const json = JSON.stringify([{ a: null, b: 2 }]);
    const r = jsonToCsv(json);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.output).toBe("a,b\n,2");
  });
});

describe("round-trip", () => {
  it("CSV → JSON → CSV preserves the table (incl. quoted commas)", () => {
    const csv = 'name,note\nMark,"hello, world"\nZhen,designer';
    const toJson = csvToJson(csv);
    expect(toJson.ok).toBe(true);
    if (!toJson.ok) return;
    const backToCsv = jsonToCsv(toJson.output);
    expect(backToCsv).toEqual({ ok: true, empty: false, output: csv });
  });
});
