import { readStoredString } from "@/lib/browser/safe-storage";
import type { LoopMode } from "@/content/music";

// Persistence keys, defaults, and pure readers for the audio player's
// preferences — extracted from audio-player-context.tsx so the parsing /
// clamping logic is unit-testable without mounting the provider.

export const STORAGE = {
  featureEnabled: "m4rkyu.audio.featureEnabled",
  bgmVolume: "m4rkyu.audio.bgmVolume",
  sfxVolume: "m4rkyu.audio.sfxVolume",
  loopMode: "m4rkyu.audio.loopMode",
  shuffle: "m4rkyu.audio.shuffle",
  trackIndex: "m4rkyu.audio.trackIndex",
} as const;

export const DEFAULTS = {
  bgmVolume: 0.5,
  sfxVolume: 0.6,
  loopMode: "playlist" as LoopMode,
  shuffle: false,
  trackIndex: 0,
  crossfadeMs: 1000,
};

/** Clamp any number into the 0..1 volume range; non-finite → 0. */
export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Read a numeric pref from storage, falling back when absent/unparseable. */
export function readNumber(key: string, fallback: number): number {
  const raw = readStoredString(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Read the stored loop mode, defaulting when missing or invalid. */
export function readLoopMode(): LoopMode {
  const value = readStoredString(STORAGE.loopMode);
  return value === "off" || value === "track" || value === "playlist"
    ? value
    : DEFAULTS.loopMode;
}
