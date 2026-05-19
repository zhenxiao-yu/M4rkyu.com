"use client";

import { useMemo } from "react";
import {
  Music2,
  Pause,
  Play,
  Play as PlayTest,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSoundEnabled } from "@/hooks/use-sound-enabled";
import { cn, FOCUS_RING } from "@/lib/utils";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { playCue } from "@/lib/audio/ui-sound";
import type { LoopMode } from "@/content/music";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const LOOP_ROTATION: Record<LoopMode, LoopMode> = {
  off: "playlist",
  playlist: "track",
  track: "off",
};

interface AudioPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AudioPlayerDialog({
  open,
  onOpenChange,
}: AudioPlayerDialogProps) {
  const t = useTranslations("AudioPlayer");
  const soundEnabled = useSoundEnabled();
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    playerState,
    currentTime,
    duration,
    loopMode,
    shuffle,
    bgmVolume,
    sfxVolume,
    togglePlay,
    next,
    prev,
    playTrack,
    seekTo,
    setBgmVolume,
    setSfxVolume,
    setLoopMode,
    toggleShuffle,
  } = useAudioPlayer();

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const pct = Number(event.target.value);
    if (!Number.isFinite(pct) || !duration) return;
    seekTo((pct / 100) * duration);
  }

  const LoopIcon = loopMode === "track" ? Repeat1 : Repeat;
  const isLoading = playerState === "loading";
  const hasTracks = tracks.length > 0;
  const isUnavailable = hasTracks && playerState === "error";
  const loopLabelKey =
    loopMode === "off"
      ? "loopOff"
      : loopMode === "track"
        ? "loopTrack"
        : "loopPlaylist";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 overflow-hidden p-0",
          // Desktop: centered, comfortable width.
          "md:max-w-md",
          // Mobile: bottom sheet, same pattern as command palette.
          "max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:top-auto",
          "max-md:h-auto max-md:max-h-[90dvh] max-md:w-full max-md:max-w-none",
          "max-md:translate-x-0 max-md:translate-y-0",
          "max-md:rounded-b-none max-md:rounded-t-2xl",
        )}
        hideCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </VisuallyHidden>

        {/* Mobile drag handle */}
        <div
          aria-hidden="true"
          className="grid shrink-0 place-items-center pb-1 pt-2.5 md:hidden"
        >
          <span className="h-1.5 w-12 rounded-full bg-border" />
        </div>

        {/* Now-playing block */}
        <div className="flex items-center gap-3 border-b border-border/70 bg-muted/30 px-5 py-4">
          <div
            aria-hidden="true"
            className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-background"
          >
            <span className="absolute inset-0 bg-cyber-grid opacity-30" />
            <Music2 className="relative size-5 text-foreground/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("nowPlaying")}
            </p>
            <p className="truncate text-sm font-medium text-foreground">
              {isUnavailable
                ? t("trackUnavailable")
                : (currentTrack?.title ?? t("noTrack"))}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {hasTracks
                ? (currentTrack?.artist ?? "—")
                : t("noEnabledTracks")}
            </p>
          </div>
        </div>

        {/* Seek bar */}
        <div className="px-5 pt-4">
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={handleSeek}
            aria-label={t("seekLabel")}
            className="w-full"
            style={
              {
                // Custom-property bridge so the runtime fill width
                // tracks `progress` without a re-render-heavy pseudo
                // approach.
                "--progress": `${progress}%`,
              } as React.CSSProperties
            }
          />
          <div className="mt-1 flex justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport row */}
        <div className="flex items-center justify-center gap-2 px-5 py-3">
          <TransportButton
            label={t("shuffle")}
            active={shuffle}
            disabled={!hasTracks}
            onClick={toggleShuffle}
          >
            <Shuffle className="size-4" />
          </TransportButton>
          <TransportButton label={t("prev")} disabled={!hasTracks} onClick={prev}>
            <SkipBack className="size-5" />
          </TransportButton>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? t("pause") : t("play")}
            disabled={isLoading || !hasTracks}
            className={cn(
              "grid size-14 place-items-center rounded-full border border-border bg-foreground text-background shadow-sm transition-[transform,background-color] duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-55 motion-safe:active:scale-95",
              FOCUS_RING,
            )}
          >
            {isLoading ? (
              <Waves className="size-6 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 translate-x-px" />
            )}
          </button>
          <TransportButton label={t("next")} disabled={!hasTracks} onClick={next}>
            <SkipForward className="size-5" />
          </TransportButton>
          <TransportButton
            label={t(loopLabelKey)}
            active={loopMode !== "off"}
            disabled={!hasTracks}
            onClick={() => setLoopMode(LOOP_ROTATION[loopMode])}
          >
            <LoopIcon className="size-4" />
          </TransportButton>
        </div>

        {/* Volume sliders */}
        <div className="grid gap-3 border-t border-border/70 bg-muted/20 px-5 py-4">
          <VolumeRow
            icon={
              bgmVolume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )
            }
            label={t("bgmVolume")}
            value={bgmVolume}
            onChange={setBgmVolume}
          />
          <VolumeRow
            icon={<Waves className="size-4" />}
            label={t("sfxVolume")}
            value={sfxVolume}
            onChange={setSfxVolume}
            trailing={
              <button
                type="button"
                onClick={() => playCue("confirm")}
                aria-label={t("sfxTestAria")}
                disabled={!soundEnabled}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm border border-border bg-background/40 px-2 py-1",
                  "font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground",
                  "transition-[background-color,border-color,color] duration-(--motion-fast) ease-(--ease-premium)",
                  "hover:border-ring/60 hover:bg-ring/10 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45",
                  FOCUS_RING,
                )}
              >
                <PlayTest aria-hidden="true" className="size-2.5" />
                {t("sfxTest")}
              </button>
            }
          />
        </div>

        {/* Playlist */}
        <div className="border-t border-border/70 px-2 py-2 max-h-56 overflow-y-auto overscroll-contain">
          <p className="px-3 py-2 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("playlist")}
          </p>
          <ul className="grid gap-0.5">
            {tracks.length === 0 ? (
              <li className="px-3 pb-3 text-xs text-muted-foreground">
                {t("noEnabledTracks")}
              </li>
            ) : null}
            {tracks.map((track, index) => {
              const active = index === currentTrackIndex;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => playTrack(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted",
                      active && "bg-muted text-foreground",
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-sm border font-mono text-[0.62rem] uppercase tracking-[0.18em]",
                        active
                          ? "border-ring/60 bg-ring/10 text-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {active && isPlaying ? (
                        <Pause className="size-3" />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {track.title}
                      </span>
                      <span className="block truncate text-[0.7rem] text-muted-foreground">
                        {track.artist}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TransportButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-transparent text-muted-foreground transition-[background-color,border-color,color] duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45",
        FOCUS_RING,
        active && "border-ring/45 bg-ring/10 text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function VolumeRow({
  icon,
  label,
  value,
  onChange,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <span className="w-12 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
        className="flex-1"
        style={
          {
            "--progress": `${value * 100}%`,
          } as React.CSSProperties
        }
      />
      <span className="w-9 text-right font-mono text-[0.62rem] tabular-nums text-muted-foreground">
        {Math.round(value * 100)}
      </span>
      {trailing ?? null}
    </div>
  );
}
