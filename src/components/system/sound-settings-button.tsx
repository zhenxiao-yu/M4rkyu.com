"use client";

import { useState } from "react";
import { Headphones, Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { playCue } from "@/lib/audio/ui-sound";
import { AudioPlayerDialog } from "./audio-player-dialog";

/**
 * Single audio control in the header chrome. Click opens the
 * AudioPlayerDialog — a media-player UI with transport, loop / shuffle,
 * BGM + SFX volume sliders, and the playlist. Replaces the old pair of
 * SoundToggle + MusicToggle buttons.
 *
 * The button itself shows the current playback state via the icon
 * (Headphones idle, Play paused, Pause playing) so the user gets
 * feedback without opening the dialog.
 */
export function SoundSettingsButton() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("AudioPlayer");
  const { isPlaying } = useAudioPlayer();

  const Icon = isPlaying ? Pause : Headphones;
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen === open) return;
    setOpen(nextOpen);
    playCue(nextOpen ? "open" : "close");
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-state={isPlaying ? "playing" : "paused"}
            aria-label={t("openLabel")}
            onClick={() => handleOpenChange(true)}
            className={cn(
              "relative inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
              "hover:-translate-y-px hover:border-ring/50 hover:text-foreground active:translate-y-0",
              FOCUS_RING,
              isPlaying && "border-ring/60 text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {isPlaying ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 size-1.5 rounded-full bg-ring shadow-[0_0_0_2px_var(--background)]"
              />
            ) : null}
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("openLabel")}</TooltipContent>
      </Tooltip>
      <AudioPlayerDialog open={open} onOpenChange={handleOpenChange} />
    </>
  );
}

// Re-export a tiny standalone Play/Pause helper for headless usage —
// e.g. a "now playing" pill in the mobile sheet that wants to toggle
// playback without opening the dialog.
export function QuickPlayPauseButton({ className }: { className?: string }) {
  const t = useTranslations("AudioPlayer");
  const { isPlaying, togglePlay, currentTrack } = useAudioPlayer();
  if (!currentTrack) return null;
  return (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={isPlaying ? t("pause") : t("play")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:text-foreground",
        FOCUS_RING_INSET,
        className,
      )}
    >
      {isPlaying ? (
        <Pause aria-hidden="true" className="size-4" />
      ) : (
        <Play aria-hidden="true" className="size-4 translate-x-px" />
      )}
    </button>
  );
}
