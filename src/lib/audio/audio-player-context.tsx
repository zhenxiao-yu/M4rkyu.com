"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  readStoredString,
  writeStoredString,
} from "@/lib/browser/safe-storage";
import { musicTracks, type LoopMode, type MusicTrack } from "@/content/music";

const STORAGE = {
  bgmVolume: "m4rkyu.audio.bgmVolume",
  sfxVolume: "m4rkyu.audio.sfxVolume",
  loopMode: "m4rkyu.audio.loopMode",
  shuffle: "m4rkyu.audio.shuffle",
  trackIndex: "m4rkyu.audio.trackIndex",
} as const;

const DEFAULTS = {
  bgmVolume: 0.5,
  sfxVolume: 0.6,
  loopMode: "playlist" as LoopMode,
  shuffle: false,
  trackIndex: 0,
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function readNumber(key: string, fallback: number): number {
  const raw = readStoredString(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readLoopMode(): LoopMode {
  const value = readStoredString(STORAGE.loopMode);
  return value === "off" || value === "track" || value === "playlist"
    ? value
    : DEFAULTS.loopMode;
}

interface AudioPlayerContextValue {
  // Playlist
  tracks: MusicTrack[];
  currentTrackIndex: number;
  currentTrack: MusicTrack | undefined;

  // Transport state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loopMode: LoopMode;
  shuffle: boolean;

  // Volume
  bgmVolume: number;
  sfxVolume: number;

  // Actions
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  playTrack: (index: number) => void;
  seekTo: (seconds: number) => void;
  setBgmVolume: (value: number) => void;
  setSfxVolume: (value: number) => void;
  setLoopMode: (mode: LoopMode) => void;
  toggleShuffle: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

/**
 * Site-wide background-music player.
 *
 * Owns a single hidden `<audio>` element that survives every route
 * change because the provider is mounted at the locale layout level.
 * Track selection, transport state, loop / shuffle, and BGM + SFX
 * volume are all persisted to localStorage so the user's preferences
 * survive reload. Playback state itself (isPlaying) is *not* persisted
 * — browsers block autoplay across reload anyway, so attempting to
 * resume would just leave a paused player in a "playing" state.
 *
 * Native HTML5 audio — no library dependency. For 3 tracks + a UI it's
 * smaller and simpler than howler / use-sound.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Init from storage (synchronous, so the first render matches what
  // the user will see). SSR returns defaults; that's fine — the
  // `<audio>` element only exists client-side and re-renders won't
  // visibly flash because the player UI is gated behind the dialog.
  const [bgmVolume, setBgmVolumeState] = useState<number>(() =>
    clamp01(readNumber(STORAGE.bgmVolume, DEFAULTS.bgmVolume)),
  );
  const [sfxVolume, setSfxVolumeState] = useState<number>(() =>
    clamp01(readNumber(STORAGE.sfxVolume, DEFAULTS.sfxVolume)),
  );
  const [loopMode, setLoopModeState] = useState<LoopMode>(() => readLoopMode());
  const [shuffle, setShuffle] = useState<boolean>(
    () => readStoredString(STORAGE.shuffle) === "on",
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(() => {
    const raw = readNumber(STORAGE.trackIndex, DEFAULTS.trackIndex);
    if (raw < 0 || raw >= musicTracks.length) return DEFAULTS.trackIndex;
    return Math.floor(raw);
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = musicTracks[currentTrackIndex];

  // Apply volume to the audio element whenever it changes. Storing
  // alongside so the next mount restores. Volume is a `number` 0–1,
  // matching the HTMLAudioElement API exactly.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = bgmVolume;
    writeStoredString(STORAGE.bgmVolume, String(bgmVolume));
  }, [bgmVolume]);

  // SFX volume is consumed by the ui-sound module via the same storage
  // key. Persist on every change so playCue() reads the latest value
  // synchronously without needing a subscription.
  useEffect(() => {
    writeStoredString(STORAGE.sfxVolume, String(sfxVolume));
  }, [sfxVolume]);

  useEffect(() => {
    writeStoredString(STORAGE.loopMode, loopMode);
    if (audioRef.current) audioRef.current.loop = loopMode === "track";
  }, [loopMode]);

  useEffect(() => {
    writeStoredString(STORAGE.shuffle, shuffle ? "on" : "off");
  }, [shuffle]);

  useEffect(() => {
    writeStoredString(STORAGE.trackIndex, String(currentTrackIndex));
  }, [currentTrackIndex]);

  const pickNextIndex = useCallback(
    (direction: 1 | -1) => {
      const len = musicTracks.length;
      if (len === 0) return 0;
      if (shuffle && len > 1) {
        let next = currentTrackIndex;
        while (next === currentTrackIndex) {
          next = Math.floor(Math.random() * len);
        }
        return next;
      }
      return (currentTrackIndex + direction + len) % len;
    },
    [currentTrackIndex, shuffle],
  );

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {
      // Autoplay block / network error — keep state in sync.
      setIsPlaying(false);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current?.paused) play();
    else pause();
  }, [play, pause]);

  const next = useCallback(() => {
    setCurrentTrackIndex((current) => {
      const len = musicTracks.length;
      if (len === 0) return current;
      if (shuffle && len > 1) {
        let n = current;
        while (n === current) n = Math.floor(Math.random() * len);
        return n;
      }
      return (current + 1) % len;
    });
  }, [shuffle]);

  const prev = useCallback(() => {
    // If we're more than 3 seconds into the track, restart it before
    // jumping to the previous track — matches the iOS / Spotify pattern.
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentTrackIndex(() => pickNextIndex(-1));
  }, [pickNextIndex]);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= musicTracks.length) return;
    setCurrentTrackIndex(index);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, seconds), audio.duration || 0);
  }, []);

  const setBgmVolume = useCallback((value: number) => {
    setBgmVolumeState(clamp01(value));
  }, []);

  const setSfxVolume = useCallback((value: number) => {
    setSfxVolumeState(clamp01(value));
  }, []);

  const setLoopMode = useCallback((mode: LoopMode) => {
    setLoopModeState(mode);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((current) => !current);
  }, []);

  // Audio element lifecycle: bind transport events once on mount.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      // `audio.loop` (set from loopMode === "track") covers the
      // track-repeat case natively — we only handle the other two
      // here. Read latest state via refs would be cleaner, but the
      // event handler closes over `loopMode` via the dep array of the
      // outer effect that re-binds when it changes.
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // `ended` advance behaviour. Re-bound when loopMode / shuffle change
  // so the handler closes over the latest values. Cheap — fires once
  // per track end.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (loopMode === "off") {
        setIsPlaying(false);
        return;
      }
      // loopMode === "playlist". (Track loop is handled by audio.loop.)
      setCurrentTrackIndex((current) => {
        const len = musicTracks.length;
        if (len === 0) return current;
        if (shuffle && len > 1) {
          let n = current;
          while (n === current) n = Math.floor(Math.random() * len);
          return n;
        }
        return (current + 1) % len;
      });
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [loopMode, shuffle]);

  // When the track changes, swap the audio src. Auto-play only if the
  // user was already playing (so first load stays silent until they
  // press play, satisfying browser autoplay policy).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    const wasPlaying = !audio.paused;
    audio.src = currentTrack.src;
    audio.load();
    if (wasPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      tracks: musicTracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      loopMode,
      shuffle,
      bgmVolume,
      sfxVolume,
      togglePlay,
      play,
      pause,
      next,
      prev,
      playTrack,
      seekTo,
      setBgmVolume,
      setSfxVolume,
      setLoopMode,
      toggleShuffle,
    }),
    [
      currentTrackIndex,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      loopMode,
      shuffle,
      bgmVolume,
      sfxVolume,
      togglePlay,
      play,
      pause,
      next,
      prev,
      playTrack,
      seekTo,
      setBgmVolume,
      setSfxVolume,
      setLoopMode,
      toggleShuffle,
    ],
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      {/* The hidden audio element lives at the provider root so it
       * persists across navigation. `preload="metadata"` fetches just
       * enough to populate `duration` without burning bandwidth before
       * the user presses play. */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        aria-hidden="true"
      />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error(
      "useAudioPlayer must be used inside <AudioPlayerProvider>",
    );
  }
  return ctx;
}

/** Read the SFX volume synchronously from storage. Used by ui-sound.ts
 * so the synth gain scales against the user's preference without
 * needing a subscription. */
export function readSfxVolume(): number {
  const raw = readNumber(STORAGE.sfxVolume, DEFAULTS.sfxVolume);
  return clamp01(raw);
}
