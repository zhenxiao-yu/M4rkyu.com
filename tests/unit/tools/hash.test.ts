import { describe, expect, it } from "vitest";

import { bufferToHex, HASH_ALGOS } from "@/lib/tools/hash";

describe("bufferToHex", () => {
  it("returns an empty string for an empty buffer", () => {
    expect(bufferToHex(new Uint8Array([]).buffer)).toBe("");
  });

  it("zero-pads each byte to two lowercase hex chars", () => {
    expect(bufferToHex(new Uint8Array([0x00, 0x0a, 0x0f, 0xff]).buffer)).toBe(
      "000a0fff",
    );
  });

  it("encodes a multi-byte sequence in order", () => {
    expect(
      bufferToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]).buffer),
    ).toBe("deadbeef");
  });

  it("matches the known SHA-256 of the empty string", () => {
    // Reference digest of "" — guards the byte ordering / padding end to end.
    const empty = [
      0xe3, 0xb0, 0xc4, 0x42, 0x98, 0xfc, 0x1c, 0x14, 0x9a, 0xfb, 0xf4, 0xc8,
      0x99, 0x6f, 0xb9, 0x24, 0x27, 0xae, 0x41, 0xe4, 0x64, 0x9b, 0x93, 0x4c,
      0xa4, 0x95, 0x99, 0x1b, 0x78, 0x52, 0xb8, 0x55,
    ];
    expect(bufferToHex(new Uint8Array(empty).buffer)).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});

describe("HASH_ALGOS", () => {
  it("lists the four SubtleCrypto digests in display order", () => {
    expect(HASH_ALGOS).toEqual(["SHA-1", "SHA-256", "SHA-384", "SHA-512"]);
  });
});
