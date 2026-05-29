"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { useAudioToggle } from "@/lib/audio/use-audio-toggle";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Single-line title that auto-scrolls (marquee) only when the text is
 * wider than its container — otherwise it sits static and truncates.
 * A hidden measuring span reports the natural text width regardless of
 * which branch is rendered, and a ResizeObserver keeps the decision in
 * sync as the dock resizes. Scroll speed is held roughly constant
 * (~36px/s) by deriving the duration from the travel distance. Frozen
 * to a plain truncate when `prefers-reduced-motion` is set.
 */
function ScrollingTitle({
  text,
  reducedMotion,
  className,
}: {
  text: string;
  reducedMotion: boolean;
  className?: string;
}) {
  const clipRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [textW, setTextW] = useState(0);
  const [clipW, setClipW] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) setTextW(measureRef.current.offsetWidth);
      if (clipRef.current) setClipW(clipRef.current.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (clipRef.current) observer.observe(clipRef.current);
    return () => observer.disconnect();
  }, [text]);

  const GAP = 32; // matches the pr-8 gap between the two copies
  const scrolling = !reducedMotion && clipW > 0 && textW > clipW + 1;
  const duration = Math.max(6, (textW + GAP) / 36);

  return (
    <div ref={clipRef} className={cn("relative w-full overflow-hidden", className)}>
      {/* Hidden width probe — never clipped, so offsetWidth is exact. */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap"
      >
        {text}
      </span>
      {scrolling ? (
        <div
          className="flex w-max whitespace-nowrap animate-[marquee_var(--marquee-dur)_linear_infinite]"
          style={{ ["--marquee-dur" as never]: `${duration}s` }}
        >
          <span className="pr-8">{text}</span>
          <span className="pr-8" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span className="block truncate">{text}</span>
      )}
    </div>
  );
}

function NowPlayingDock({ reducedMotion }: { reducedMotion: boolean }) {
  const t = useTranslations("AudioPlayer");
  const { currentTrack, featureEnabled, isPlaying, next, prev, audioGraphReady } =
    useAudioPlayer();
  const { toggle } = useAudioToggle();
  const isEngaged = featureEnabled && (audioGraphReady || isPlaying);
  const [expanded, setExpanded] = useState(false);

  if (!isEngaged) return null;

  return (
    <div className="pointer-events-auto relative flex justify-center">
      <div
        className={cn(
          "glass-surface flex w-[min(92vw,30rem)] items-center overflow-hidden rounded-full px-2 py-1.5",
          !reducedMotion &&
            "transition-[width,transform,box-shadow] duration-300 ease-(--ease-premium)",
          expanded && "sm:w-[min(92vw,34rem)]",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "ml-0.5 flex h-4 shrink-0 items-end gap-0.5 text-ring",
            !isPlaying && "opacity-40 [&_.eq-bar]:[animation-play-state:paused]",
          )}
        >
          <span className="eq-bar" style={{ ["--eq-order" as never]: 0 }} />
          <span className="eq-bar" style={{ ["--eq-order" as never]: 1 }} />
          <span className="eq-bar" style={{ ["--eq-order" as never]: 2 }} />
          <span className="eq-bar" style={{ ["--eq-order" as never]: 3 }} />
        </span>

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? t("pause") : t("play")}
          className={cn(
            "group flex min-w-0 flex-1 flex-col overflow-hidden rounded-md px-2 py-0.5 text-left",
            "transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/5",
            FOCUS_RING,
          )}
        >
          {expanded ? (
            <span className="truncate font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t("nowPlaying")}
            </span>
          ) : null}
          <ScrollingTitle
            text={currentTrack?.title ?? t("noTrack")}
            reducedMotion={reducedMotion}
            className="text-xs font-medium text-foreground transition-colors group-hover:text-ring"
          />
          {expanded && currentTrack?.artist ? (
            <span className="block truncate text-[0.7rem] text-muted-foreground">
              {currentTrack.artist}
            </span>
          ) : null}
        </button>

        <div
          className={cn(
            "flex items-center",
            expanded ? "gap-0.5 pl-1" : "gap-1 pl-2",
          )}
        >
          {expanded ? (
            <MiniButton
              label={t("prev")}
              onClick={prev}
              reducedMotion={reducedMotion}
            >
              <SkipBack className="size-4" />
            </MiniButton>
          ) : null}

          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? t("pause") : t("play")}
            className={cn(
              "grid place-items-center rounded-full bg-foreground text-background shadow-sm",
              expanded ? "size-9" : "size-8",
              "transition-[transform,background-color] duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/90",
              !reducedMotion && "motion-safe:active:scale-90",
              FOCUS_RING,
            )}
          >
            {isPlaying ? (
              <Pause className={cn(expanded ? "size-4" : "size-3.5")} />
            ) : (
              <Play
                className={cn(
                  expanded ? "size-4 translate-x-px" : "size-3.5 translate-x-px",
                )}
              />
            )}
          </button>

          {expanded ? (
            <MiniButton
              label={t("next")}
              onClick={next}
              reducedMotion={reducedMotion}
            >
              <SkipForward className="size-4" />
            </MiniButton>
          ) : null}

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? t("collapseLabel") : t("expandLabel")}
            aria-expanded={expanded}
            className={cn(
              "grid size-8 place-items-center rounded-full text-muted-foreground",
              "transition-[transform,color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
              "hover:bg-foreground/10 hover:text-foreground",
              !reducedMotion && "motion-safe:active:scale-90",
              FOCUS_RING,
            )}
          >
            {expanded ? (
              <ChevronUp aria-hidden="true" className="size-4" />
            ) : (
              <ChevronDown aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniButton({
  label,
  onClick,
  reducedMotion,
  children,
}: {
  label: string;
  onClick: () => void;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid size-8 place-items-center rounded-full text-muted-foreground",
        "transition-[transform,color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:bg-foreground/10 hover:text-foreground",
        !reducedMotion && "motion-safe:active:scale-90",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}

export function AudioNavBar() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full z-10 flex justify-center lg:hidden">
      <NowPlayingDock reducedMotion={Boolean(reducedMotion)} />
    </div>
  );
}
