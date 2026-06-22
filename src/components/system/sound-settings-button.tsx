"use client";

import { Headphones } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, FOCUS_RING } from "@/lib/utils";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";

/**
 * Mobile audio entry point. Opens the shared AudioPlayerDialog (mounted
 * once by AudioPlayerDialogHost) via context — the desktop HUD strip
 * opens the same modal from its now-playing title. The icon carries a
 * live dot when something is playing.
 */
export function SoundSettingsButton() {
  const t = useTranslations("AudioPlayer");
  const { isPlaying, setDialogOpen } = useAudioPlayer();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={t("openLabel")}
          aria-haspopup="dialog"
          onClick={() => setDialogOpen(true)}
          className={cn(
            "relative inline-flex size-9 pointer-coarse:size-11 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
            "hover:-translate-y-px hover:border-ring/50 hover:text-foreground active:translate-y-0",
            FOCUS_RING,
            isPlaying && "border-ring/60 text-foreground",
          )}
        >
          <Headphones aria-hidden="true" className="size-4" />
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
  );
}
