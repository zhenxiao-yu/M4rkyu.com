"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULTS, STORAGE, clamp01, readNumber } from "./player-prefs";
import {
  useAudioEngine,
  type AudioPlayerContextValue,
} from "./use-audio-engine";

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

// Site-wide BGM player; survives route changes (mounted at locale layout). Two <audio> for crossfade, one preload. Prefs persist; isPlaying does not (autoplay is blocked on reload). All engine logic lives in `useAudioEngine`.
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const { value, audioARef, audioBRef, preloadAudioRef } = useAudioEngine();

  return (
    <AudioPlayerContext.Provider value={value}>
      {/* Hidden audio elements live at the provider root so music
       * persists across navigation. `preload="metadata"` fetches just
       * enough to populate `duration` without burning bandwidth before
       * the user presses play. A/B elements support soft crossfades;
       * the third element prewarms only the likely next track. */}
      <audio ref={audioARef} preload="metadata" aria-hidden="true" />
      <audio ref={audioBRef} preload="metadata" aria-hidden="true" />
      <audio ref={preloadAudioRef} preload="metadata" aria-hidden="true" />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used inside <AudioPlayerProvider>");
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
