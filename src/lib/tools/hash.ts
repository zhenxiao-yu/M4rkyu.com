// Pure helpers for the hash-generator tool. The digest itself is browser-only
// (Web Crypto's async `crypto.subtle.digest`), so it stays in the component;
// here we keep only the side-effect-free pieces that are worth unit-testing.

/** The SubtleCrypto digest algorithms we surface, in display order. */
export const HASH_ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;

export type HashAlgo = (typeof HASH_ALGOS)[number];

/**
 * Lowercase hex encoding of a digest buffer — the canonical way hashes are
 * shown (`crypto.subtle.digest` hands back an ArrayBuffer, never a string).
 * Each byte becomes a zero-padded two-char pair, e.g. `0a 1f …`.
 */
export function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}
