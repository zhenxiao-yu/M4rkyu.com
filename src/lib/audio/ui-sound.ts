import {
  dispatchStoredValueChanged,
  readStoredString,
  subscribeStoredValue,
  writeStoredString,
} from "@/lib/browser/safe-storage";

// Storage key the audio-player dialog writes the SFX slider into.
// Kept inline (not imported from audio-player-context) to keep this
// module dependency-free and SSR-safe — it's imported by both server
// and client code paths. Default matches the provider's DEFAULTS.sfxVolume.
const SFX_VOLUME_KEY = "m4rkyu.audio.sfxVolume";
const SFX_VOLUME_DEFAULT = 0.6;

function readSfxVolume(): number {
  const raw = readStoredString(SFX_VOLUME_KEY);
  if (!raw) return SFX_VOLUME_DEFAULT;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return SFX_VOLUME_DEFAULT;
  return Math.min(1, Math.max(0, parsed));
}

// Procedural UI sound (Web Audio, single Oscillator+Gain per cue). SSR-safe; default OFF; prefers-reduced-motion forces off. Spec: docs/UNIFIED_VISUAL_DIRECTION.md §4.10 + §8.

const STORAGE_KEY = "m4rkyu.sound";
const CHANGE_EVENT = "m4rkyu:sound:change";

export type SoundCue =
  | "hover-soft"
  | "click"
  | "open"
  | "close"
  | "confirm"
  | "save"
  | "unsave"
  | "unlock"
  | "error-soft"
  | "scene-enter";

interface CueConfig {
  type: OscillatorType;
  freqStart: number;
  freqEnd: number;
  durationMs: number;
  volume: number;
}

// Cues stay short, quiet, and mostly mid-band: muted mechanical,
// soft-pixel, warm-terminal. Silence is part of the design.
const CUES: Record<SoundCue, CueConfig> = {
  "hover-soft": {
    type: "sine",
    freqStart: 520,
    freqEnd: 560,
    durationMs: 32,
    volume: 0.018,
  },
  click: {
    type: "triangle",
    freqStart: 520,
    freqEnd: 360,
    durationMs: 58,
    volume: 0.045,
  },
  open: {
    type: "triangle",
    freqStart: 420,
    freqEnd: 680,
    durationMs: 125,
    volume: 0.04,
  },
  close: {
    type: "triangle",
    freqStart: 620,
    freqEnd: 360,
    durationMs: 105,
    volume: 0.034,
  },
  confirm: {
    type: "triangle",
    freqStart: 520,
    freqEnd: 780,
    durationMs: 155,
    volume: 0.045,
  },
  save: {
    type: "triangle",
    freqStart: 560,
    freqEnd: 820,
    durationMs: 135,
    volume: 0.046,
  },
  unsave: {
    type: "sine",
    freqStart: 520,
    freqEnd: 340,
    durationMs: 115,
    volume: 0.032,
  },
  unlock: {
    type: "sine",
    freqStart: 480,
    freqEnd: 920,
    durationMs: 420,
    volume: 0.04,
  },
  "error-soft": {
    type: "triangle",
    freqStart: 210,
    freqEnd: 185,
    durationMs: 125,
    volume: 0.046,
  },
  "scene-enter": {
    type: "sine",
    freqStart: 300,
    freqEnd: 620,
    durationMs: 260,
    volume: 0.03,
  },
};

let audioContext: AudioContext | null = null;
const lastPlayedAt = new Map<SoundCue, number>();
const CUE_COOLDOWNS_MS: Partial<Record<SoundCue, number>> = {
  "hover-soft": 140,
  click: 35,
  unlock: 2000,
  "error-soft": 160,
  "scene-enter": 3000,
};

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioContext = new Ctor();
    return audioContext;
  } catch {
    return null;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Returns `true` only when the user has explicitly enabled UI sound. */
export function isSoundEnabled(): boolean {
  return readStoredString(STORAGE_KEY) === "on";
}

/**
 * Persists the toggle state and emits a same-window event so the
 * `useSoundEnabled` hook can resync. Cross-tab sync rides on the
 * native `storage` event.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  writeStoredString(STORAGE_KEY, enabled ? "on" : "off");
  dispatchStoredValueChanged(CHANGE_EVENT);
}

/** Subscribe to in-tab + cross-tab toggle changes. Used by useSoundEnabled. */
export function subscribeSoundEnabled(callback: () => void): () => void {
  return subscribeStoredValue(STORAGE_KEY, CHANGE_EVENT, callback);
}

/**
 * Plays one cue. No-op when sound is disabled, reduced-motion is set,
 * the page is server-rendered, or the AudioContext fails to initialize.
 *
 * This always honors the global sound-enabled toggle and reduced-motion.
 */
export function playCue(cue: SoundCue): void {
  if (!isSoundEnabled()) return;
  if (prefersReducedMotion()) return;
  const elapsed =
    typeof performance === "undefined" ? Date.now() : performance.now();
  const cooldown = CUE_COOLDOWNS_MS[cue] ?? 0;
  const previous = lastPlayedAt.get(cue) ?? -Infinity;
  if (elapsed - previous < cooldown) return;
  lastPlayedAt.set(cue, elapsed);

  const ctx = getContext();
  if (!ctx) return;

  // Safari + Chrome require the context to be resumed inside a user
  // gesture; this function is only called from click handlers, so
  // resume() is safe here.
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }

  const config = CUES[cue];
  const now = ctx.currentTime;
  const end = now + config.durationMs / 1000;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = config.type;
  osc.frequency.setValueAtTime(config.freqStart, now);
  if (config.freqEnd !== config.freqStart) {
    osc.frequency.exponentialRampToValueAtTime(config.freqEnd, end);
  }

  // Tiny attack + exponential decay → a percussive blip rather than a tone.
  // User SFX volume scales the cue's intrinsic gain (which itself stays
  // ≤ 0.08 to keep cues below ~-18 LUFS at full volume).
  const userVolume = readSfxVolume();
  // exponentialRampToValueAtTime can't ramp to 0; floor at 0.0001 the
  // same way we floor the decay target.
  const peak = Math.max(0.0001, config.volume * userVolume);
  gain.gain.setValueAtTime(peak, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(end);
}

export function playBadgeUnlockCue(): void {
  playCue("unlock");
}

export function playContactSentCue(): void {
  playCue("confirm");
}

export function playNotificationCue(options?: { highValue?: boolean }): void {
  playCue(options?.highValue ? "unlock" : "confirm");
}

export function playAdminSuccessCue(): void {
  playCue("confirm");
}
