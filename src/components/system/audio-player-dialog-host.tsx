"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { playCue } from "@/lib/audio/ui-sound";
import { AudioPlayerDialog } from "./audio-player-dialog";

/**
 * The single, site-wide audio player modal. Mounted once inside
 * `AudioPlayerProvider` so any trigger — the desktop HUD now-playing
 * title or the mobile headphones button — opens the same instance via
 * `setDialogOpen`. Plays the open / close UI cue on every transition
 * (programmatic opens and Radix-driven closes alike).
 */
export function AudioPlayerDialogHost() {
  const { dialogOpen, setDialogOpen } = useAudioPlayer();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    playCue(dialogOpen ? "open" : "close");
  }, [dialogOpen]);

  return <AudioPlayerDialog open={dialogOpen} onOpenChange={setDialogOpen} />;
}
