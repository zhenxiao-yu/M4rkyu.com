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
  crossfadeMs: 1000,
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

function isAudioElement(
  audio: HTMLAudioElement | null,
): audio is HTMLAudioElement {
  return audio !== null;
}

interface AudioPlayerContextValue {
  // Playlist
  tracks: MusicTrack[];
  currentTrackIndex: number;
  currentTrack: MusicTrack | undefined;

  // Transport state
  isPlaying: boolean;
  playerState: "idle" | "loading" | "ready" | "playing" | "paused" | "error";
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
 * Owns hidden native audio elements that survive every route change
 * because the provider is mounted at the locale layout level. Two
 * elements handle crossfades; a third prewarms next-track metadata.
 * Track selection, transport state, loop / shuffle, and BGM + SFX
 * volume are all persisted to localStorage so the user's preferences
 * survive reload. Playback state itself (isPlaying) is *not* persisted
 * — browsers block autoplay across reload anyway, so attempting to
 * resume would just leave a paused player in a "playing" state.
 *
 * Native HTML5 audio — no library dependency. This keeps the player
 * lightweight even as the manifest grows.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const predictedNextIndexRef = useRef<number | null>(null);
  const failedTrackIdsRef = useRef<Set<string>>(new Set());
  const wantsPlaybackRef = useRef(false);
  const currentTrackRef = useRef<MusicTrack | undefined>(undefined);
  const currentTrackIndexRef = useRef(0);

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
  const [playerState, setPlayerState] =
    useState<AudioPlayerContextValue["playerState"]>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = musicTracks[currentTrackIndex];
  const hasTracks = musicTracks.length > 0;

  useEffect(() => {
    currentTrackRef.current = currentTrack;
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrack, currentTrackIndex]);

  // Apply volume to the audio element whenever it changes. Storing
  // alongside so the next mount restores. Volume is a `number` 0–1,
  // matching the HTMLAudioElement API exactly.
  useEffect(() => {
    for (const audio of [audioARef.current, audioBRef.current]) {
      if (audio && audio === activeAudioRef.current) audio.volume = bgmVolume;
    }
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
    for (const audio of [audioARef.current, audioBRef.current]) {
      if (audio) audio.loop = loopMode === "track";
    }
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

  const pickNextAvailableIndex = useCallback(
    (fromIndex: number, failedIds: Set<string>) => {
      const len = musicTracks.length;
      if (len === 0 || failedIds.size >= len) return null;
      for (let offset = 1; offset <= len; offset += 1) {
        const index = (fromIndex + offset) % len;
        const track = musicTracks[index];
        if (track && !failedIds.has(track.id)) return index;
      }
      return null;
    },
    [],
  );

  const markTrackUnavailable = useCallback(
    (track: MusicTrack | undefined, shouldRecover: boolean) => {
      setIsPlaying(false);
      setPlayerState("error");
      if (!track) return;

      failedTrackIdsRef.current.add(track.id);
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[audio] Track unavailable: ${track.id} (${track.src}). ` +
            "Check public/audio/music or set enabled: false.",
        );
      }

      if (!shouldRecover) return;

      const nextIndex = pickNextAvailableIndex(
        currentTrackIndexRef.current,
        failedTrackIdsRef.current,
      );
      if (nextIndex === null) {
        wantsPlaybackRef.current = false;
        window.setTimeout(() => setPlayerState("paused"), 900);
        return;
      }

      window.setTimeout(() => {
        setCurrentTrackIndex(nextIndex);
      }, 650);
    },
    [pickNextAvailableIndex],
  );

  const play = useCallback(() => {
    const audio = activeAudioRef.current;
    if (!audio || !currentTrack) {
      setPlayerState("idle");
      return;
    }
    wantsPlaybackRef.current = true;
    failedTrackIdsRef.current.delete(currentTrack.id);
    setPlayerState("loading");
    audio.volume = bgmVolume;
    audio.play().catch(() => {
      // Autoplay block / network error — keep state in sync.
      markTrackUnavailable(currentTrack, true);
    });
  }, [bgmVolume, currentTrack, markTrackUnavailable]);

  const pause = useCallback(() => {
    wantsPlaybackRef.current = false;
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    audioARef.current?.pause();
    audioBRef.current?.pause();
    setPlayerState("paused");
  }, []);

  const togglePlay = useCallback(() => {
    if (activeAudioRef.current?.paused) play();
    else pause();
  }, [play, pause]);

  const next = useCallback(() => {
    failedTrackIdsRef.current.clear();
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
    failedTrackIdsRef.current.clear();
    // If we're more than 3 seconds into the track, restart it before
    // jumping to the previous track — matches the iOS / Spotify pattern.
    const audio = activeAudioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setCurrentTrackIndex(() => pickNextIndex(-1));
  }, [pickNextIndex]);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= musicTracks.length) return;
    failedTrackIdsRef.current.clear();
    setCurrentTrackIndex(index);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    const audio = activeAudioRef.current;
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

  const clearFadeTimer = useCallback(() => {
    if (!fadeTimerRef.current) return;
    window.clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = null;
  }, []);

  const getInactiveAudio = useCallback(() => {
    const active = activeAudioRef.current;
    const a = audioARef.current;
    const b = audioBRef.current;
    if (!a) return b;
    if (!b) return a;
    return active === a ? b : a;
  }, []);

  const fadeBetween = useCallback(
    (from: HTMLAudioElement, to: HTMLAudioElement) => {
      clearFadeTimer();
      const startedAt = performance.now();
      const durationMs = DEFAULTS.crossfadeMs;
      to.volume = 0;
      from.volume = bgmVolume;
      to.play().catch(() => {
        markTrackUnavailable(currentTrack, true);
      });
      fadeTimerRef.current = window.setInterval(() => {
        const progress = Math.min(
          1,
          (performance.now() - startedAt) / durationMs,
        );
        from.volume = bgmVolume * (1 - progress);
        to.volume = bgmVolume * progress;
        if (progress >= 1) {
          clearFadeTimer();
          from.pause();
          from.currentTime = 0;
          from.removeAttribute("src");
          from.load();
          to.volume = bgmVolume;
          activeAudioRef.current = to;
          setIsPlaying(!to.paused);
          setPlayerState(to.paused ? "paused" : "playing");
        }
      }, 50);
    },
    [bgmVolume, clearFadeTimer, currentTrack, markTrackUnavailable],
  );

  // Audio element lifecycle: bind transport events once on mount.
  useEffect(() => {
    const elements = [audioARef.current, audioBRef.current].filter(
      isAudioElement,
    );
    const first = audioARef.current;
    if (!first || elements.length === 0) return;
    activeAudioRef.current = first;

    const onPlay = (event: Event) => {
      if (event.currentTarget !== activeAudioRef.current) return;
      wantsPlaybackRef.current = true;
      setIsPlaying(true);
      setPlayerState("playing");
    };
    const onPause = (event: Event) => {
      if (event.currentTarget !== activeAudioRef.current) return;
      setIsPlaying(false);
      setPlayerState("paused");
    };
    const onTime = (event: Event) => {
      const audio = event.currentTarget as HTMLAudioElement;
      if (audio !== activeAudioRef.current) return;
      setCurrentTime(audio.currentTime);
    };
    const onMeta = (event: Event) => {
      const audio = event.currentTarget as HTMLAudioElement;
      if (audio !== activeAudioRef.current) return;
      setDuration(audio.duration || 0);
      setPlayerState(audio.paused ? "ready" : "playing");
    };
    const onWaiting = (event: Event) => {
      if (event.currentTarget === activeAudioRef.current) {
        setPlayerState("loading");
      }
    };
    const onError = (event: Event) => {
      if (event.currentTarget !== activeAudioRef.current) return;
      markTrackUnavailable(currentTrackRef.current, wantsPlaybackRef.current);
    };

    for (const audio of elements) {
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("timeupdate", onTime);
      audio.addEventListener("loadedmetadata", onMeta);
      audio.addEventListener("durationchange", onMeta);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("error", onError);
    }

    return () => {
      for (const audio of elements) {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
        audio.removeEventListener("timeupdate", onTime);
        audio.removeEventListener("loadedmetadata", onMeta);
        audio.removeEventListener("durationchange", onMeta);
        audio.removeEventListener("waiting", onWaiting);
        audio.removeEventListener("error", onError);
      }
    };
  }, [markTrackUnavailable]);

  // `ended` advance behaviour. Re-bound when loopMode / shuffle change
  // so the handler closes over the latest values. Cheap — fires once
  // per track end.
  useEffect(() => {
    const elements = [audioARef.current, audioBRef.current].filter(
      isAudioElement,
    );
    if (elements.length === 0) return;
    const onEnded = () => {
      if (loopMode === "off") {
        setIsPlaying(false);
        setPlayerState("paused");
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
    for (const audio of elements) audio.addEventListener("ended", onEnded);
    return () => {
      for (const audio of elements) audio.removeEventListener("ended", onEnded);
    };
  }, [loopMode, shuffle]);

  // When the track changes, load the new source. Auto-play only if the
  // user was already playing (so first load stays silent until they
  // press play, satisfying browser autoplay policy). While playing,
  // a second audio element crossfades the next stream in.
  useEffect(() => {
    const active = activeAudioRef.current ?? audioARef.current;
    if (!active || !currentTrack) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setPlayerState("idle");
      return;
    }
    if (!activeAudioRef.current) activeAudioRef.current = active;
    const wasPlaying = !active.paused || wantsPlaybackRef.current;
    const predicted = predictedNextIndexRef.current === currentTrackIndex;
    const target = wasPlaying ? getInactiveAudio() : active;
    if (!target) return;
    setCurrentTime(0);
    setDuration(currentTrack.approxSeconds ?? 0);
    setPlayerState(wasPlaying ? "loading" : "idle");
    if (target.src !== new URL(currentTrack.src, window.location.href).href) {
      target.src = currentTrack.src;
      target.preload = predicted ? "auto" : "metadata";
      target.load();
    }
    if (wasPlaying) {
      fadeBetween(active, target);
    } else {
      active.volume = bgmVolume;
      active.src = currentTrack.src;
      active.preload = "metadata";
      active.load();
    }
    predictedNextIndexRef.current = null;
  }, [
    bgmVolume,
    currentTrack,
    currentTrackIndex,
    fadeBetween,
    getInactiveAudio,
    hasTracks,
  ]);

  useEffect(() => {
    const preloadAudio = preloadAudioRef.current;
    if (!preloadAudio || !isPlaying || musicTracks.length < 2) return;
    const nextIndex = pickNextIndex(1);
    const nextTrack = musicTracks[nextIndex];
    if (!nextTrack) return;
    predictedNextIndexRef.current = nextIndex;
    preloadAudio.src = nextTrack.src;
    preloadAudio.preload = "metadata";
    preloadAudio.load();
  }, [currentTrackIndex, isPlaying, pickNextIndex]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      tracks: musicTracks,
      currentTrackIndex,
      currentTrack,
      isPlaying,
      playerState,
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
      playerState,
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
      {/* Hidden audio elements live at the provider root so music
       * persists across navigation. `preload="metadata"` fetches just
       * enough to populate `duration` without burning bandwidth before
       * the user presses play. A/B elements support soft crossfades;
       * the third element prewarms only the likely next track. */}
      <audio
        ref={audioARef}
        preload="metadata"
        aria-hidden="true"
      />
      <audio
        ref={audioBRef}
        preload="metadata"
        aria-hidden="true"
      />
      <audio
        ref={preloadAudioRef}
        preload="metadata"
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
