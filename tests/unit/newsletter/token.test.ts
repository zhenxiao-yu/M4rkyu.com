import { describe, expect, it } from "vitest";

import {
  signSubscribeToken,
  verifySubscribeToken,
} from "@/lib/newsletter/token";

const SECRET = "test-secret-key";
const NOW = 1_780_000_000_000;

describe("subscribe token", () => {
  it("round-trips and normalizes the email", () => {
    const token = signSubscribeToken("  Reader@Example.COM ", SECRET, NOW);
    const result = verifySubscribeToken(token, SECRET, NOW + 1000);
    expect(result).toEqual({ ok: true, email: "reader@example.com" });
  });

  it("rejects a token signed with a different secret", () => {
    const token = signSubscribeToken("a@b.com", SECRET, NOW);
    expect(verifySubscribeToken(token, "other-secret", NOW)).toEqual({
      ok: false,
      reason: "bad-signature",
    });
  });

  it("rejects a tampered payload", () => {
    const token = signSubscribeToken("a@b.com", SECRET, NOW);
    const [body, sig] = token.split(".");
    const forged = Buffer.from('{"e":"evil@b.com","x":9999999999999}').toString(
      "base64url",
    );
    expect(verifySubscribeToken(`${forged}.${sig}`, SECRET, NOW)).toEqual({
      ok: false,
      reason: "bad-signature",
    });
    expect(body).toBeTruthy();
  });

  it("rejects an expired token", () => {
    const token = signSubscribeToken("a@b.com", SECRET, NOW, 1000);
    expect(verifySubscribeToken(token, SECRET, NOW + 2000)).toEqual({
      ok: false,
      reason: "expired",
    });
  });

  it("rejects a malformed token", () => {
    expect(verifySubscribeToken("not-a-token", SECRET, NOW)).toEqual({
      ok: false,
      reason: "malformed",
    });
    expect(verifySubscribeToken("", SECRET, NOW)).toEqual({
      ok: false,
      reason: "malformed",
    });
  });
});
