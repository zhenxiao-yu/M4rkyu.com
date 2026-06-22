import { describe, expect, it } from "vitest";

import { base64UrlDecode, decodeJwt } from "@/lib/tools/jwt";

// Real fixtures (base64url-encoded with Node's Buffer, padding stripped) so the
// decoder is exercised against genuine tokens rather than hand-faked strings.
const VALID =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXJrIiwibmFtZSI6Ik00cmt5dSIsImlhdCI6MTcxNzAwMDAwMCwiZXhwIjoxNzE3MDAzNjAwfQ.sigSIGsig";

// Same header, payload {"name":"于震潇 ✦ café"} — multibyte + emoji-class glyph.
const UNICODE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoi5LqO6ZyH5r2HIOKcpiBjYWbDqSJ9.sig";

describe("base64UrlDecode", () => {
  it("decodes a padless base64url segment", () => {
    expect(base64UrlDecode("eyJhIjoxfQ")).toBe('{"a":1}');
  });

  it("rejects characters outside the base64url alphabet", () => {
    expect(base64UrlDecode("not valid!!")).toBeNull();
  });
});

describe("decodeJwt", () => {
  it("decodes a valid token without verifying the signature", () => {
    const result = decodeJwt(VALID);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.headerObject).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payloadObject).toMatchObject({ sub: "mark", name: "M4rkyu" });
    expect(result.signature).toBe("sigSIGsig");
    // iat 1717000000 -> ms epoch.
    expect(result.issuedAt?.getTime()).toBe(1717000000 * 1000);
    expect(result.expiresAt?.getTime()).toBe(1717003600 * 1000);
    // Pretty-printed JSON, not the raw single-line claim string.
    expect(result.payload).toContain("\n");
  });

  it("fails cleanly on a two-part token (missing signature)", () => {
    const result = decodeJwt("eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ");
    expect(result).toEqual({ ok: false, code: "structure" });
  });

  it("fails cleanly on garbage rather than throwing", () => {
    expect(decodeJwt("just-some-random-string")).toEqual({
      ok: false,
      code: "structure",
    });
    // Three parts, but the header isn't valid base64url JSON.
    const broken = decodeJwt("@@@.@@@.@@@");
    expect(broken.ok).toBe(false);
    if (!broken.ok) expect(broken.code).toBe("base64");
  });

  it("preserves a unicode payload through the UTF-8 round-trip", () => {
    const result = decodeJwt(UNICODE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payloadObject).toEqual({ name: "于震潇 ✦ café" });
  });

  it("treats an empty token as a structure failure", () => {
    expect(decodeJwt("   ")).toEqual({ ok: false, code: "structure" });
  });

  it("rejects a payload that decodes to a non-object (e.g. a JSON array)", () => {
    // header {"alg":"none"} . payload [1,2,3] . sig
    const arrayPayload =
      "eyJhbGciOiJub25lIn0.WzEsMiwzXQ.sig";
    const result = decodeJwt(arrayPayload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("json");
      expect(result.segment).toBe("payload");
    }
  });
});
