import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULTS,
  STORAGE,
  clamp01,
  readLoopMode,
  readNumber,
} from "@/lib/audio/player-prefs";
import {
  removeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";

// Direct tests for the audio preferences readers extracted from the provider.
// Runs in the default `node` env; with no window, safe-storage uses its
// in-memory fallback, which writeStoredString/removeStoredValue drive here.

const KEYS = Object.values(STORAGE);

function clearAll() {
  for (const key of KEYS) removeStoredValue(key);
}

beforeEach(clearAll);
afterEach(clearAll);

describe("clamp01", () => {
  it("clamps into the 0..1 range", () => {
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(-1)).toBe(0);
  });

  it("maps non-finite input to 0", () => {
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("readNumber", () => {
  it("returns the fallback when the key is unset", () => {
    expect(readNumber(STORAGE.bgmVolume, DEFAULTS.bgmVolume)).toBe(0.5);
  });

  it("reads a stored numeric value", () => {
    writeStoredString(STORAGE.bgmVolume, "0.3");
    expect(readNumber(STORAGE.bgmVolume, DEFAULTS.bgmVolume)).toBe(0.3);
  });

  it("falls back when the stored value is unparseable", () => {
    writeStoredString(STORAGE.bgmVolume, "not-a-number");
    expect(readNumber(STORAGE.bgmVolume, 0.5)).toBe(0.5);
  });
});

describe("readLoopMode", () => {
  it("defaults to playlist when unset", () => {
    expect(readLoopMode()).toBe("playlist");
  });

  it("reads a valid stored mode", () => {
    writeStoredString(STORAGE.loopMode, "track");
    expect(readLoopMode()).toBe("track");
  });

  it("rejects an invalid stored mode", () => {
    writeStoredString(STORAGE.loopMode, "nonsense");
    expect(readLoopMode()).toBe("playlist");
  });
});
