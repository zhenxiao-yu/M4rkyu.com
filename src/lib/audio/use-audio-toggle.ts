"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioPlayer } from "./audio-player-context";

/**
 * Playback helpers that survive the `featureEnabled` gate. The audio
 * provider's `play()` no-ops while the ambient player is disabled (its
 * default state), so starting music from a cold start has to enable the
 * feature first, then play once the flag has flipped.
 *
 * `setFeatureEnabled(true)` is async (a state update), so we can't call
 * `play()` in the same tick — instead we mark intent on a ref and fire
 * `play()` from an effect once `featureEnabled` (and the rebuilt `play`
 * closure) have settled. This still runs inside the browser's sticky
 * user-activation window, so autoplay policy is satisfied.
 *
 * Centralised here so the HUD transport and the mobile quick button share
 * one correct implementation instead of each re-deriving it.
 */
export function useAudioToggle() {
  const { isPlaying, featureEnabled, setFeatureEnabled, play, pause, playTrack } =
    useAudioPlayer();
  const pendingRef = useRef(false);

  useEffect(() => {
    if (pendingRef.current && featureEnabled) {
      pendingRef.current = false;
      play();
    }
  }, [featureEnabled, play]);

  const start = useCallback(() => {
    if (!featureEnabled) {
      pendingRef.current = true;
      setFeatureEnabled(true);
      return;
    }
    play();
  }, [featureEnabled, setFeatureEnabled, play]);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else start();
  }, [isPlaying, pause, start]);

  const selectTrack = useCallback(
    (index: number) => {
      playTrack(index);
      // `playTrack` only changes the index; it auto-plays solely when
      // already playing. Flag intent so the effect starts the new track
      // whether we're cold (enable first) or merely paused (the `play`
      // closure rebuilds when the track changes, re-firing the effect).
      pendingRef.current = true;
      if (!featureEnabled) setFeatureEnabled(true);
    },
    [playTrack, featureEnabled, setFeatureEnabled],
  );

  return { isPlaying, toggle, start, selectTrack };
}
