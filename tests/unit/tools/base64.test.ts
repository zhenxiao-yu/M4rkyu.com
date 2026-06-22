import { describe, expect, it } from "vitest";

import { decodeBase64, encodeBase64, runBase64 } from "@/lib/tools/base64";

describe("runBase64", () => {
  it("treats empty input as a valid empty state, never an error", () => {
    expect(runBase64("", "encode")).toEqual({ ok: true, output: "", empty: true });
    expect(runBase64("", "decode")).toEqual({ ok: true, output: "", empty: true });
  });

  it("encodes ASCII text", () => {
    expect(runBase64("hello world", "encode")).toEqual({
      ok: true,
      output: "aGVsbG8gd29ybGQ=",
      empty: false,
    });
  });

  it("decodes base64 to ASCII text", () => {
    expect(runBase64("aGVsbG8gd29ybGQ=", "decode")).toEqual({
      ok: true,
      output: "hello world",
      empty: false,
    });
  });

  it("round-trips UTF-8 (CJK + emoji)", () => {
    const original = "你好，世界 🌏 café";
    const encoded = encodeBase64(original);
    expect(decodeBase64(encoded)).toBe(original);
    expect(runBase64(encoded, "decode")).toEqual({
      ok: true,
      output: original,
      empty: false,
    });
  });

  it("accepts the URL-safe alphabet and missing padding on decode", () => {
    // "hi?>" base64 is "aGk/Pg==" → URL-safe "aGk_Pg" (no padding).
    expect(runBase64("aGk_Pg", "decode")).toEqual({
      ok: true,
      output: "hi?>",
      empty: false,
    });
  });

  it("tolerates whitespace in decode input", () => {
    expect(runBase64("aGVsbG8g\nd29ybGQ=", "decode")).toEqual({
      ok: true,
      output: "hello world",
      empty: false,
    });
  });

  it("returns a typed error (not a throw) on malformed base64", () => {
    expect(() => runBase64("!!!not base64!!!", "decode")).not.toThrow();
    expect(runBase64("!!!not base64!!!", "decode")).toEqual({
      ok: false,
      reason: "malformed",
    });
  });

  it("returns a typed error on bad length / invalid UTF-8 bytes", () => {
    // length % 4 === 1 is impossible valid base64.
    expect(runBase64("a", "decode")).toEqual({ ok: false, reason: "malformed" });
    // Valid base64, but the bytes aren't valid UTF-8 (lone continuation byte).
    expect(runBase64("gA==", "decode")).toEqual({ ok: false, reason: "malformed" });
  });

  it("never errors on encode, even for unusual input", () => {
    expect(runBase64("%", "encode")).toEqual({
      ok: true,
      output: "JQ==",
      empty: false,
    });
  });
});
