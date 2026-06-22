// Pure-ish RFC 4122 version 4 UUID generation for the uuid tool. No React,
// no DOM coupling beyond the optional crypto-backed RNG — unit-tested in
// tests/unit/tools/uuid.test.ts.
//
// The default path prefers the platform `crypto.randomUUID()` (fast, native,
// FIPS-quality entropy). The explicit `uuidV4FromBytes` builder exists for the
// fallback path (older webviews without `randomUUID`) and for tests: it accepts
// a 16-byte buffer so the format/version/variant nibbles can be asserted
// deterministically. Math.random is never used — entropy always comes from a
// CSPRNG (crypto.getRandomValues) or injected bytes.

const HEX = "0123456789abcdef";

function byteToHex(byte: number): string {
  return HEX[(byte >> 4) & 0xf] + HEX[byte & 0xf];
}

/**
 * Build a canonical v4 UUID string from exactly 16 bytes. The version (4) and
 * variant (10xx) bits are forced per RFC 4122 §4.4, so the caller's bytes only
 * need to supply entropy — the structural nibbles are normalized here.
 */
export function uuidV4FromBytes(bytes: Uint8Array): string {
  if (bytes.length < 16) {
    throw new RangeError("uuidV4FromBytes requires at least 16 bytes");
  }
  // Force version 4 (high nibble of byte 6) and the RFC 4122 variant (top two
  // bits of byte 8 set to 10).
  const b = Uint8Array.prototype.slice.call(bytes, 0, 16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;

  let out = "";
  for (let i = 0; i < 16; i++) {
    out += byteToHex(b[i]);
    if (i === 3 || i === 5 || i === 7 || i === 9) out += "-";
  }
  return out;
}

/** Source of 16 random bytes. Injectable so tests stay deterministic. */
export type RandomBytes = (length: number) => Uint8Array;

const cryptoRandomBytes: RandomBytes = (length) => {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return buf;
};

/**
 * Generate one v4 UUID. Uses the native `crypto.randomUUID()` when present;
 * otherwise falls back to a `crypto.getRandomValues`-backed builder. A custom
 * `randomBytes` source forces the fallback path (used by tests).
 */
export function generateUuid(randomBytes?: RandomBytes): string {
  if (
    !randomBytes &&
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return uuidV4FromBytes((randomBytes ?? cryptoRandomBytes)(16));
}

/** Generate `count` v4 UUIDs. Caller is responsible for clamping `count`. */
export function generateUuids(count: number, randomBytes?: RandomBytes): string[] {
  const n = Math.max(0, Math.trunc(count));
  return Array.from({ length: n }, () => generateUuid(randomBytes));
}
