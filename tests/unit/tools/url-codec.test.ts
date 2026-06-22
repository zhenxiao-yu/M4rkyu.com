import { describe, expect, it } from "vitest";

import { runUrlCodec } from "@/lib/tools/url-codec";

describe("runUrlCodec", () => {
  it("treats empty input as a valid empty state, never an error", () => {
    const r = runUrlCodec("", "encode", "component");
    expect(r).toEqual({ ok: true, output: "", empty: true });
  });

  it("encodes reserved chars in component scope", () => {
    const r = runUrlCodec("a b?c=/&d", "encode", "component");
    expect(r).toEqual({
      ok: true,
      output: "a%20b%3Fc%3D%2F%26d",
      empty: false,
    });
  });

  it("preserves structural chars in uri scope", () => {
    const r = runUrlCodec("https://x.com/a b?q=1&r=2", "encode", "uri");
    expect(r).toEqual({
      ok: true,
      output: "https://x.com/a%20b?q=1&r=2",
      empty: false,
    });
  });

  it("round-trips encode → decode in component scope", () => {
    const original = "hello world?next=/work&q=tailwind v4";
    const encoded = runUrlCodec(original, "encode", "component");
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const decoded = runUrlCodec(encoded.output, "decode", "component");
    expect(decoded).toEqual({ ok: true, output: original, empty: false });
  });

  it("decodes percent-escapes in component scope", () => {
    const r = runUrlCodec("a%20b%26c", "decode", "component");
    expect(r).toEqual({ ok: true, output: "a b&c", empty: false });
  });

  it("returns a typed error (not a throw) on a lone percent", () => {
    expect(() => runUrlCodec("%", "decode", "component")).not.toThrow();
    expect(runUrlCodec("%", "decode", "component")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("returns a typed error on an invalid hex escape", () => {
    expect(runUrlCodec("%zz", "decode", "component")).toEqual({
      ok: false,
      reason: "malformed",
    });
    expect(runUrlCodec("%E0%A4%A", "decode", "uri")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("never errors on encode, even for malformed-looking input", () => {
    expect(runUrlCodec("%", "encode", "component")).toEqual({
      ok: true,
      output: "%25",
      empty: false,
    });
  });
});
