// Pure JWT decoding for the jwt-decoder tool. No React, no DOM, no network —
// unit-tested in tests/unit/tools/jwt.test.ts. This is DISPLAY-ONLY: it never
// verifies the signature and must never throw, regardless of how malformed the
// input is. Callers branch on the discriminated `ok` field.

const BASE64URL_RE = /^[A-Za-z0-9_-]*$/;

/** Stable, machine-readable reasons a token failed to decode. */
export type JwtErrorCode =
  | "structure" // not three dot-separated parts
  | "base64" // a segment isn't valid base64url
  | "json"; // a decoded segment isn't valid JSON

export interface JwtDecodeFailure {
  ok: false;
  /** Which segment broke, when knowable. */
  code: JwtErrorCode;
  segment?: "header" | "payload";
}

export interface JwtDecodeSuccess {
  ok: true;
  /** Pretty-printed (2-space) JSON of each segment, ready for a <pre>. */
  header: string;
  payload: string;
  /** Parsed claim objects for further inspection. */
  headerObject: Record<string, unknown>;
  payloadObject: Record<string, unknown>;
  /** Raw third segment — present but NEVER verified. */
  signature: string;
  /** `iat` claim as a Date, when it's a finite numeric epoch-seconds value. */
  issuedAt: Date | null;
  /** `exp` claim as a Date, when it's a finite numeric epoch-seconds value. */
  expiresAt: Date | null;
}

export type JwtDecodeResult = JwtDecodeSuccess | JwtDecodeFailure;

/**
 * Decode a base64url string to a UTF-8 string. Handles the `-_` alphabet,
 * missing padding, and multibyte/unicode payloads. Returns `null` instead of
 * throwing on anything it can't decode (bad characters, truncated bytes).
 */
export function base64UrlDecode(input: string): string | null {
  if (!BASE64URL_RE.test(input)) return null;
  // Restore the standard alphabet and re-pad to a multiple of 4.
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = normalized.length % 4;
  const padded =
    remainder === 0 ? normalized : normalized + "=".repeat(4 - remainder);

  let binary: string;
  try {
    if (typeof atob === "function") {
      binary = atob(padded);
    } else {
      // Node (and the vitest `node` env) has no global atob in older targets.
      binary = Buffer.from(padded, "base64").toString("binary");
    }
  } catch {
    return null;
  }

  // Re-decode the latin1 byte string as UTF-8 so multibyte glyphs survive.
  try {
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

/** Coerce a claim into a Date only when it's a finite numeric epoch (seconds). */
function epochToDate(value: unknown): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const date = new Date(value * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Decode a JWT for display. Splits on `.`, base64url-decodes the header and
 * payload, parses each as JSON, and surfaces `iat` / `exp` as Dates. The
 * signature is returned untouched and is never validated. Never throws.
 */
export function decodeJwt(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) {
    return { ok: false, code: "structure" };
  }

  const [rawHeader, rawPayload, signature] = parts;

  const headerJson = base64UrlDecode(rawHeader);
  if (headerJson === null) {
    return { ok: false, code: "base64", segment: "header" };
  }
  const payloadJson = base64UrlDecode(rawPayload);
  if (payloadJson === null) {
    return { ok: false, code: "base64", segment: "payload" };
  }

  let headerObject: unknown;
  try {
    headerObject = JSON.parse(headerJson);
  } catch {
    return { ok: false, code: "json", segment: "header" };
  }
  let payloadObject: unknown;
  try {
    payloadObject = JSON.parse(payloadJson);
  } catch {
    return { ok: false, code: "json", segment: "payload" };
  }

  if (!isPlainObject(headerObject)) {
    return { ok: false, code: "json", segment: "header" };
  }
  if (!isPlainObject(payloadObject)) {
    return { ok: false, code: "json", segment: "payload" };
  }

  return {
    ok: true,
    header: JSON.stringify(headerObject, null, 2),
    payload: JSON.stringify(payloadObject, null, 2),
    headerObject,
    payloadObject,
    signature,
    issuedAt: epochToDate(payloadObject.iat),
    expiresAt: epochToDate(payloadObject.exp),
  };
}
