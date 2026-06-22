// Pure Base64 encode/decode logic shared by the base64 tool. No React, no
// DOM — unit-tested in tests/unit/tools/base64.test.ts.
//
// `btoa`/`atob` only speak Latin-1, so raw multibyte text (CJK, emoji) throws
// an `InvalidCharacterError` on encode and silently corrupts on decode. We
// bridge through `TextEncoder`/`TextDecoder` so the full UTF-8 range
// round-trips, and return a typed result instead of throwing on malformed
// decode input (bad padding, non-base64 chars, truncated multibyte sequences).

export type Base64Mode = "encode" | "decode";

export type Base64Result =
  | { ok: true; output: string; empty: boolean }
  | { ok: false; reason: "malformed" };

/** UTF-8 text → base64. Total — never throws for any string. */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  // Chunk the byte→char-code mapping so very large inputs don't blow the
  // argument limit of `String.fromCharCode(...spread)`.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** base64 → UTF-8 text. Throws on malformed input (caught by `runBase64`). */
export function decodeBase64(text: string): string {
  // `atob` rejects whitespace and the URL-safe alphabet, so normalize first:
  // strip whitespace, map `-_` → `+/`, and restore `=` padding.
  let normalized = text.replace(/[\s]/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  if (pad === 2) normalized += "==";
  else if (pad === 3) normalized += "=";
  else if (pad === 1) throw new Error("malformed base64");
  const binary = atob(normalized); // throws InvalidCharacterError on bad chars
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  // `fatal: true` makes the decoder throw on invalid UTF-8 byte sequences
  // (e.g. valid base64 that isn't valid UTF-8) instead of emitting U+FFFD.
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/**
 * Run a single encode/decode pass. Empty input is a valid, non-error state
 * (`empty: true`); malformed decode input yields `{ ok: false }` rather than
 * throwing. Encode is total, so it never reports an error.
 */
export function runBase64(input: string, mode: Base64Mode): Base64Result {
  if (input === "") return { ok: true, output: "", empty: true };
  if (mode === "encode") {
    return { ok: true, output: encodeBase64(input), empty: false };
  }
  try {
    return { ok: true, output: decodeBase64(input), empty: false };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}
