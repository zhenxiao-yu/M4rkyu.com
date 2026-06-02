import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless double-opt-in token: `base64url(payload).base64url(hmac)`.
// No DB row is needed for the pending state — the signed, expiring token
// IS the pending state. Pure (takes secret + `now` as args) so it stays
// unit-testable and deterministic; the action/route wire in env + Date.now.

const SEP = ".";
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24h

interface TokenPayload {
  /** Lowercased subscriber email. */
  e: string;
  /** Expiry, epoch ms. */
  x: number;
}

export function signSubscribeToken(
  email: string,
  secret: string,
  now: number,
  ttlMs: number = DEFAULT_TTL_MS,
): string {
  const payload: TokenPayload = { e: email.trim().toLowerCase(), x: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}${SEP}${sig}`;
}

export type VerifyResult =
  | { ok: true; email: string }
  | { ok: false; reason: "malformed" | "bad-signature" | "expired" };

export function verifySubscribeToken(
  token: string,
  secret: string,
  now: number,
): VerifyResult {
  const parts = token.split(SEP);
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }
  const [body, sig] = parts;

  // Constant-time signature check. timingSafeEqual throws on length
  // mismatch, so guard on length first (a length mismatch is already a
  // bad signature — no timing signal leaks the secret).
  const provided = Buffer.from(sig);
  const expected = createHmac("sha256", secret).update(body).digest();
  const expectedB64 = Buffer.from(expected.toString("base64url"));
  if (
    provided.length !== expectedB64.length ||
    !timingSafeEqual(provided, expectedB64)
  ) {
    return { ok: false, reason: "bad-signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (typeof payload?.e !== "string" || typeof payload?.x !== "number") {
    return { ok: false, reason: "malformed" };
  }
  if (now > payload.x) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, email: payload.e };
}
