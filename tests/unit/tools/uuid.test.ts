import { describe, expect, it } from "vitest";

import {
  generateUuid,
  generateUuids,
  uuidV4FromBytes,
} from "@/lib/tools/uuid";

// Canonical v4 shape: 8-4-4-4-12 hex, version nibble `4`, variant nibble in
// [89ab].
const V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Deterministic byte source for the fallback builder.
const seq = (...vals: number[]): Uint8Array => Uint8Array.from(vals);

describe("uuidV4FromBytes", () => {
  it("emits a canonical v4 string with forced version + variant nibbles", () => {
    // All-zero entropy: only the structural nibbles should be non-zero.
    const id = uuidV4FromBytes(new Uint8Array(16));
    expect(id).toMatch(V4_RE);
    expect(id).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("forces the version nibble to 4 even when input byte 6 is 0xff", () => {
    const bytes = new Uint8Array(16).fill(0xff);
    const id = uuidV4FromBytes(bytes);
    expect(id).toMatch(V4_RE);
    // byte 6 high nibble -> '4', byte 8 high nibble -> variant 'b' (1011).
    expect(id[14]).toBe("4");
    expect(id[19]).toBe("b");
  });

  it("preserves entropy bytes outside the structural nibbles", () => {
    const id = uuidV4FromBytes(seq(0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0));
    expect(id).toMatch(V4_RE);
    expect(id.startsWith("12345678-9abc-4")).toBe(true);
  });

  it("does not mutate the caller's buffer", () => {
    const bytes = new Uint8Array(16).fill(0xff);
    uuidV4FromBytes(bytes);
    expect([...bytes]).toEqual(new Array(16).fill(0xff));
  });

  it("throws when given fewer than 16 bytes", () => {
    expect(() => uuidV4FromBytes(new Uint8Array(8))).toThrow(RangeError);
  });
});

describe("generateUuid", () => {
  it("produces a valid v4 UUID via the native path", () => {
    expect(generateUuid()).toMatch(V4_RE);
  });

  it("produces a valid v4 UUID via an injected RNG (fallback path)", () => {
    let calls = 0;
    const id = generateUuid((len) => {
      calls += 1;
      return new Uint8Array(len).fill(0xab);
    });
    expect(calls).toBe(1);
    expect(id).toMatch(V4_RE);
  });
});

describe("generateUuids", () => {
  it("returns the requested count, all valid and unique", () => {
    const ids = generateUuids(50);
    expect(ids).toHaveLength(50);
    expect(ids.every((id) => V4_RE.test(id))).toBe(true);
    expect(new Set(ids).size).toBe(50);
  });

  it("clamps non-positive / fractional counts to whole non-negative lengths", () => {
    expect(generateUuids(0)).toHaveLength(0);
    expect(generateUuids(-5)).toHaveLength(0);
    expect(generateUuids(3.9)).toHaveLength(3);
  });
});
