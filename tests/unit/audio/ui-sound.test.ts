// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Unit tests for the procedural UI-sound cue layer (`src/lib/audio/ui-sound.ts`).
// The existing audio test covers the BGM *player*; this covers the *cue* path:
// the sound-enabled toggle + persistence, and the gating inside `playCue`
// (disabled / reduced-motion / no-AudioContext short-circuits + cue cooldown).
//
// jsdom implements neither AudioContext nor matchMedia, so we install minimal
// fakes. Each cue that clears its guards creates exactly one oscillator, which
// we count to assert "played" vs "stayed silent" without real audio.

const SOUND_KEY = "m4rkyu.sound";

interface FakeOscillator {
  type: OscillatorType;
  frequency: {
    setValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
}

let oscillators: FakeOscillator[] = [];

class FakeAudioContext {
  state: AudioContextState = "running";
  currentTime = 0;
  destination = {} as AudioDestinationNode;

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  createOscillator(): FakeOscillator {
    const osc: FakeOscillator = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      // `osc.connect(gain).connect(destination)` — return the passed node so
      // the chain in playCue resolves.
      connect: vi.fn((node: unknown) => node),
      start: vi.fn(),
      stop: vi.fn(),
    };
    oscillators.push(osc);
    return osc;
  }

  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
}

function setReducedMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: reduced,
    media: "",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }) as unknown as typeof window.matchMedia;
}

// Fresh module per test so the internal AudioContext singleton + cue-cooldown
// map never leak between cases.
async function loadSound() {
  vi.resetModules();
  return import("@/lib/audio/ui-sound");
}

let sound: typeof import("@/lib/audio/ui-sound");

beforeEach(async () => {
  localStorage.clear();
  oscillators = [];
  (window as unknown as { AudioContext: unknown }).AudioContext =
    FakeAudioContext;
  setReducedMotion(false);
  sound = await loadSound();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ui-sound — toggle + persistence", () => {
  it("defaults to off", () => {
    expect(sound.isSoundEnabled()).toBe(false);
  });

  it("reads an explicit 'on' from storage", () => {
    localStorage.setItem(SOUND_KEY, "on");
    expect(sound.isSoundEnabled()).toBe(true);
  });

  it("persists the toggle both directions", () => {
    sound.setSoundEnabled(true);
    expect(localStorage.getItem(SOUND_KEY)).toBe("on");
    expect(sound.isSoundEnabled()).toBe(true);

    sound.setSoundEnabled(false);
    expect(localStorage.getItem(SOUND_KEY)).toBe("off");
    expect(sound.isSoundEnabled()).toBe(false);
  });

  it("notifies subscribers when the toggle changes", () => {
    const callback = vi.fn();
    const unsubscribe = sound.subscribeSoundEnabled(callback);
    sound.setSoundEnabled(true);
    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
    sound.setSoundEnabled(false);
    expect(callback).toHaveBeenCalledTimes(1); // no longer listening
  });
});

describe("ui-sound — playCue gating", () => {
  it("stays silent when sound is disabled", () => {
    sound.playCue("click"); // disabled by default
    expect(oscillators).toHaveLength(0);
  });

  it("stays silent under reduced-motion even when enabled", () => {
    sound.setSoundEnabled(true);
    setReducedMotion(true);
    sound.playCue("click");
    expect(oscillators).toHaveLength(0);
  });

  it("stays silent when no AudioContext is available", () => {
    sound.setSoundEnabled(true);
    (window as unknown as { AudioContext?: unknown }).AudioContext = undefined;
    (
      window as unknown as { webkitAudioContext?: unknown }
    ).webkitAudioContext = undefined;
    sound.playCue("click");
    expect(oscillators).toHaveLength(0);
  });

  it("plays a single oscillator when enabled with motion allowed", () => {
    sound.setSoundEnabled(true);
    sound.playCue("click");
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0].start).toHaveBeenCalledTimes(1);
    expect(oscillators[0].stop).toHaveBeenCalledTimes(1);
  });
});

describe("ui-sound — cue cooldown", () => {
  it("suppresses a repeated cue inside its cooldown window", () => {
    sound.setSoundEnabled(true);
    // scene-enter carries a 3s cooldown; two synchronous calls => one play.
    sound.playCue("scene-enter");
    sound.playCue("scene-enter");
    expect(oscillators).toHaveLength(1);
  });

  it("allows the cue again once the cooldown has elapsed", () => {
    sound.setSoundEnabled(true);
    const now = vi.spyOn(performance, "now");

    now.mockReturnValue(0);
    sound.playCue("scene-enter");
    expect(oscillators).toHaveLength(1);

    now.mockReturnValue(3001); // past the 3000ms scene-enter cooldown
    sound.playCue("scene-enter");
    expect(oscillators).toHaveLength(2);
  });
});
