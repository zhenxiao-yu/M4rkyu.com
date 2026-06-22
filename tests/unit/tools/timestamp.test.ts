import { describe, expect, it } from "vitest";

import {
  detectEpochUnit,
  fieldsFromDateString,
  fieldsFromEpoch,
  formatRelative,
} from "@/lib/tools/timestamp";

// A known instant: 2023-11-14T22:13:20.000Z = 1700000000 s = 1700000000000 ms.
const EPOCH_S = 1700000000;
const EPOCH_MS = EPOCH_S * 1000;

describe("fieldsFromEpoch", () => {
  it("parses a valid epoch in seconds", () => {
    const r = fieldsFromEpoch(String(EPOCH_S));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fields.seconds).toBe(EPOCH_S);
    expect(r.fields.millis).toBe(EPOCH_MS);
    expect(r.fields.iso).toBe("2023-11-14T22:13:20.000Z");
  });

  it("auto-detects a 13-digit value as milliseconds", () => {
    expect(detectEpochUnit(String(EPOCH_MS))).toBe("millis");
    expect(detectEpochUnit(String(EPOCH_S))).toBe("seconds");
    const r = fieldsFromEpoch(String(EPOCH_MS));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fields.seconds).toBe(EPOCH_S);
  });

  it("returns a typed empty result for blank input", () => {
    expect(fieldsFromEpoch("")).toEqual({ ok: false, reason: "empty" });
    expect(fieldsFromEpoch("   ")).toEqual({ ok: false, reason: "empty" });
  });

  it("returns a typed invalid result for non-numeric input (never Invalid Date)", () => {
    expect(fieldsFromEpoch("abc")).toEqual({ ok: false, reason: "invalid" });
    expect(fieldsFromEpoch("12x3")).toEqual({ ok: false, reason: "invalid" });
    expect(fieldsFromEpoch("1.5")).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("fieldsFromDateString", () => {
  it("round-trips an ISO 8601 UTC string without timezone surprises", () => {
    const iso = "2023-11-14T22:13:20.000Z";
    const r = fieldsFromDateString(iso);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.fields.millis).toBe(EPOCH_MS);
    expect(r.fields.iso).toBe(iso);
  });

  it("returns typed empty / invalid results instead of Invalid Date", () => {
    expect(fieldsFromDateString("")).toEqual({ ok: false, reason: "empty" });
    expect(fieldsFromDateString("not a date")).toEqual({
      ok: false,
      reason: "invalid",
    });
  });
});

describe("formatRelative", () => {
  const now = EPOCH_MS;

  it("formats a past instant given a fixed now", () => {
    expect(formatRelative(now - 2 * 3600_000, now, "en")).toBe("2 hours ago");
  });

  it("formats a future instant given a fixed now", () => {
    expect(formatRelative(now + 3 * 86400_000, now, "en")).toBe("in 3 days");
  });

  it("uses numeric:auto for the present (now)", () => {
    expect(formatRelative(now, now, "en")).toBe("now");
  });

  it("returns an empty string for non-finite input", () => {
    expect(formatRelative(NaN, now, "en")).toBe("");
    expect(formatRelative(now, Infinity, "en")).toBe("");
  });
});
