/**
 * UI sound module — phase 7 of docs/UNIFIED_VISUAL_DIRECTION.md (§4.10 + §8).
 *
 * Generates four short procedural cues via the browser Web Audio API. No
 * audio files are shipped, no dependency added; all tones are synthesized
 * from a single Oscillator + Gain envelope per cue.
 *
 * Hard rules from the spec:
 * - Default OFF — the first sound the user ever hears is the `confirm`
 *   tone that fires the moment they enable SoundToggle.
 * - `prefers-reduced-motion` is treated as a proxy for "no surprise
 *   feedback" and forces sound off even when the toggle is on.
 * - Every public function is SSR-safe and returns a no-op when run
 *   outside a browser (so server components can import this module
 *   without crashing the build).
 */

const STORAGE_KEY = "m4rkyu.sound";
const CHANGE_EVENT = "m4rkyu:sound:change";

export type SoundCue = "click" | "confirm" | "scene-enter" | "error";

interface CueConfig {
  type: OscillatorType;
  freqStart: number;
  freqEnd: number;
  durationMs: number;
  volume: number;
}

// Each cue clamps below ~-18 LUFS-equivalent (volume ≤ 0.08). Pitches
// stay in the comfortable mid-band so the UI never feels harsh.
const CUES: Record<SoundCue, CueConfig> = {
  click: {
    type: "square",
    freqStart: 880,
    freqEnd: 660,
    durationMs: 60,
    volume: 0.06,
  },
  confirm: {
    type: "triangle",
    freqStart: 660,
    freqEnd: 880,
    durationMs: 120,
    volume: 0.08,
  },
  "scene-enter": {
    type: "square",
    freqStart: 440,
    freqEnd: 880,
    durationMs: 160,
    volume: 0.06,
  },
  error: {
    type: "square",
    freqStart: 220,
    freqEnd: 220,
    durationMs: 90,
    volume: 0.08,
  },
};

let audioContext: AudioContext | null = null;

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
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

/**
 * Persists the toggle state and emits a same-window event so the
 * `useSoundEnabled` hook can resync. Cross-tab sync rides on the
 * native `storage` event.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // localStorage unavailable (private mode, quota, …) — silently
    // skip; the toggle becomes session-only.
  }
}

/** Subscribe to in-tab + cross-tab toggle changes. Used by useSoundEnabled. */
export function subscribeSoundEnabled(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/**
 * Plays one cue. No-op when sound is disabled, reduced-motion is set,
 * the page is server-rendered, or the AudioContext fails to initialize.
 */
export function playCue(cue: SoundCue): void {
  if (!isSoundEnabled() || prefersReducedMotion()) return;
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
  gain.gain.setValueAtTime(config.volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(end);
}
