// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Characterization tests for the audio provider's state machine (TD-001,
// final slice). The provider is a 746-line "use client" component, but its
// storage-restore, volume-clamping, persistence, and playlist-navigation
// logic is reachable without ever entering the Web Audio / crossfade paths —
// so this runs in jsdom with the HTMLMediaElement methods stubbed and never
// calls play(). The track manifest is mocked for deterministic navigation.

vi.mock("@/content/music", () => ({
  musicTracks: [
    { id: "t0", title: "T0", artist: "A", src: "/audio/t0.mp3", enabled: true, approxSeconds: 100 },
    { id: "t1", title: "T1", artist: "A", src: "/audio/t1.mp3", enabled: true, approxSeconds: 100 },
    { id: "t2", title: "T2", artist: "A", src: "/audio/t2.mp3", enabled: true, approxSeconds: 100 },
  ],
}));

import {
  AudioPlayerProvider,
  readSfxVolume,
  useAudioPlayer,
} from "@/lib/audio/audio-player-context";

const KEYS = {
  featureEnabled: "m4rkyu.audio.featureEnabled",
  bgmVolume: "m4rkyu.audio.bgmVolume",
  sfxVolume: "m4rkyu.audio.sfxVolume",
  loopMode: "m4rkyu.audio.loopMode",
  shuffle: "m4rkyu.audio.shuffle",
  trackIndex: "m4rkyu.audio.trackIndex",
};

function mount() {
  return renderHook(() => useAudioPlayer(), { wrapper: AudioPlayerProvider });
}

beforeEach(() => {
  localStorage.clear();
  // jsdom doesn't implement these; the provider calls load() on mount and
  // play()/pause() on transport actions we don't exercise here.
  window.HTMLMediaElement.prototype.load = vi.fn();
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  window.HTMLMediaElement.prototype.pause = vi.fn();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AudioPlayerProvider — defaults", () => {
  it("starts from sensible defaults when storage is empty", () => {
    const { result } = mount();
    expect(result.current.featureEnabled).toBe(false);
    expect(result.current.bgmVolume).toBe(0.5);
    expect(result.current.sfxVolume).toBe(0.6);
    expect(result.current.loopMode).toBe("playlist");
    expect(result.current.shuffle).toBe(false);
    expect(result.current.currentTrackIndex).toBe(0);
    expect(result.current.tracks).toHaveLength(3);
    expect(result.current.currentTrack?.id).toBe("t0");
    expect(result.current.isPlaying).toBe(false);
  });
});

describe("AudioPlayerProvider — storage restore", () => {
  it("restores persisted preferences", () => {
    localStorage.setItem(KEYS.featureEnabled, "on");
    localStorage.setItem(KEYS.bgmVolume, "0.25");
    localStorage.setItem(KEYS.sfxVolume, "0.8");
    localStorage.setItem(KEYS.loopMode, "track");
    localStorage.setItem(KEYS.shuffle, "on");
    localStorage.setItem(KEYS.trackIndex, "2");

    const { result } = mount();
    expect(result.current.featureEnabled).toBe(true);
    expect(result.current.bgmVolume).toBe(0.25);
    expect(result.current.sfxVolume).toBe(0.8);
    expect(result.current.loopMode).toBe("track");
    expect(result.current.shuffle).toBe(true);
    expect(result.current.currentTrackIndex).toBe(2);
  });

  it("clamps an out-of-range stored track index back to the default", () => {
    localStorage.setItem(KEYS.trackIndex, "99");
    expect(mount().result.current.currentTrackIndex).toBe(0);

    cleanup();
    localStorage.setItem(KEYS.trackIndex, "-1");
    expect(mount().result.current.currentTrackIndex).toBe(0);
  });

  it("clamps an out-of-range stored volume into 0..1", () => {
    localStorage.setItem(KEYS.bgmVolume, "5");
    expect(mount().result.current.bgmVolume).toBe(1);

    cleanup();
    localStorage.setItem(KEYS.bgmVolume, "-2");
    expect(mount().result.current.bgmVolume).toBe(0);
  });

  it("falls back to the default loop mode for an unknown stored value", () => {
    localStorage.setItem(KEYS.loopMode, "bogus");
    expect(mount().result.current.loopMode).toBe("playlist");
  });
});

describe("AudioPlayerProvider — volume", () => {
  it("clamps and persists bgm volume", () => {
    const { result } = mount();
    act(() => result.current.setBgmVolume(2));
    expect(result.current.bgmVolume).toBe(1);
    expect(localStorage.getItem(KEYS.bgmVolume)).toBe("1");

    act(() => result.current.setBgmVolume(-1));
    expect(result.current.bgmVolume).toBe(0);
    expect(localStorage.getItem(KEYS.bgmVolume)).toBe("0");
  });

  it("clamps and persists sfx volume", () => {
    const { result } = mount();
    act(() => result.current.setSfxVolume(0.42));
    expect(result.current.sfxVolume).toBe(0.42);
    expect(localStorage.getItem(KEYS.sfxVolume)).toBe("0.42");
  });
});

describe("AudioPlayerProvider — loop mode", () => {
  it("updates and persists the loop mode", () => {
    const { result } = mount();
    act(() => result.current.setLoopMode("off"));
    expect(result.current.loopMode).toBe("off");
    expect(localStorage.getItem(KEYS.loopMode)).toBe("off");
  });
});

describe("AudioPlayerProvider — playlist navigation", () => {
  it("ignores navigation while the feature is disabled", () => {
    const { result } = mount();
    act(() => result.current.next());
    expect(result.current.currentTrackIndex).toBe(0);
    act(() => result.current.playTrack(2));
    expect(result.current.currentTrackIndex).toBe(0);
  });

  it("advances and wraps with next() once enabled", () => {
    const { result } = mount();
    act(() => result.current.setFeatureEnabled(true));
    act(() => result.current.next());
    expect(result.current.currentTrackIndex).toBe(1);
    act(() => result.current.next());
    expect(result.current.currentTrackIndex).toBe(2);
    act(() => result.current.next());
    expect(result.current.currentTrackIndex).toBe(0); // wraps (len 3)
  });

  it("prev() steps backward with wraparound when at the track start", () => {
    const { result } = mount();
    act(() => result.current.setFeatureEnabled(true));
    act(() => result.current.prev());
    expect(result.current.currentTrackIndex).toBe(2); // 0 -> wraps to last
  });

  it("playTrack jumps to a valid index and ignores out-of-range", () => {
    const { result } = mount();
    act(() => result.current.setFeatureEnabled(true));
    act(() => result.current.playTrack(2));
    expect(result.current.currentTrackIndex).toBe(2);
    act(() => result.current.playTrack(99));
    expect(result.current.currentTrackIndex).toBe(2);
    act(() => result.current.playTrack(-1));
    expect(result.current.currentTrackIndex).toBe(2);
  });
});

describe("AudioPlayerProvider — shuffle + feature gate", () => {
  it("toggles shuffle only when the feature is enabled", () => {
    const { result } = mount();
    act(() => result.current.toggleShuffle());
    expect(result.current.shuffle).toBe(false); // gated off

    act(() => result.current.setFeatureEnabled(true));
    act(() => result.current.toggleShuffle());
    expect(result.current.shuffle).toBe(true);
    expect(localStorage.getItem(KEYS.shuffle)).toBe("on");
  });

  it("persists the feature flag and stops playback intent when disabled", () => {
    const { result } = mount();
    act(() => result.current.setFeatureEnabled(true));
    expect(localStorage.getItem(KEYS.featureEnabled)).toBe("on");
    act(() => result.current.setFeatureEnabled(false));
    expect(localStorage.getItem(KEYS.featureEnabled)).toBe("off");
    expect(result.current.isPlaying).toBe(false);
  });
});

describe("useAudioPlayer guard + readSfxVolume", () => {
  it("throws when used outside the provider", () => {
    expect(() => renderHook(() => useAudioPlayer())).toThrow(
      /must be used inside <AudioPlayerProvider>/,
    );
  });

  it("reads the sfx volume from storage, clamped", () => {
    expect(readSfxVolume()).toBe(0.6); // default
    localStorage.setItem(KEYS.sfxVolume, "0.3");
    expect(readSfxVolume()).toBe(0.3);
    localStorage.setItem(KEYS.sfxVolume, "9");
    expect(readSfxVolume()).toBe(1); // clamped
  });
});
