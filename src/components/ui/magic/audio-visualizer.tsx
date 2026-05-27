"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { openAudioPlayer } from "@/lib/audio/player-events";
import { cn, FOCUS_RING } from "@/lib/utils";

// When a header nav dropdown is hovered or keyboard-focused its panel
// overlaps the dock area, so the notch clears out of the way. Pure CSS:
// the notch and the nav share a <header> ancestor, and each dropdown
// trigger carries a `.nav-group` marker (see desktop-nav.tsx) — no
// cross-component JS wiring. A variant always wins over the base
// opacity, so this only ever forces the notch hidden, never shown.
const NAV_DROPDOWN_HIDE = cn(
  "[header:has(.nav-group:hover)_&]:pointer-events-none [header:has(.nav-group:hover)_&]:opacity-0",
  "[header:has(.nav-group:focus-within)_&]:pointer-events-none [header:has(.nav-group:focus-within)_&]:opacity-0",
);

// Collapsible "now playing" dock that hangs off the navbar's lower edge.
// (The audio-reactive spectrum/particle canvas was removed for now — it
// overlapped page content; this module is just the glass HUD drawer.)

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

/**
 * Collapsible "now playing" drawer, centred under the dock. Once the user
 * has engaged audio it stays available as a small notch fused to the pill:
 * it auto-expands while playing, and when paused it can be reopened by
 * hovering (mouse) or tapping / dragging the notch (touch) — so playback
 * is always one gesture away instead of vanishing. Carries a live
 * equaliser glyph, the track title/artist (click → full player), and
 * inline prev / play-pause / next.
 */
function NowPlayingDock({ reducedMotion }: { reducedMotion: boolean }) {
  const t = useTranslations("AudioPlayer");
  const { currentTrack, isPlaying, togglePlay, next, prev, audioGraphReady } =
    useAudioPlayer();

  // "Engaged" = audio has been started at least once this session, so the
  // notch only appears after the user opts into sound (no idle clutter).
  // `audioGraphReady` latches true on the first play() and never resets,
  // making it a clean persistent signal; `isPlaying` covers the rare
  // browser path where the Web Audio graph couldn't be built.
  const isEngaged = audioGraphReady || isPlaying;

  const [hovering, setHovering] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const open = isEngaged && (isPlaying || hovering || userOpen);

  // Drag on the notch (touch + mouse, via pointer events): a short
  // downward drag opens, an upward drag closes. A plain tap or keyboard
  // activation falls through to `onNotchClick`, which both touch and
  // mouse synthesise after pointerup — so the toggle works for pointer
  // AND keyboard (Enter/Space) without double-firing.
  const dragRef = useRef<{ y: number; moved: boolean } | null>(null);
  function onNotchDown(event: React.PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = { y: event.clientY, moved: false };
  }
  function onNotchMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dy = event.clientY - drag.y;
    if (Math.abs(dy) > 5) drag.moved = true;
    if (dy > 8) setUserOpen(true);
    else if (dy < -8) setUserOpen(false);
  }
  function onNotchClick() {
    // A completed drag already set the open state via onNotchMove; don't
    // immediately toggle it back. Keyboard activation has no preceding
    // pointer drag (dragRef is null), so it always toggles.
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.moved) return;
    setUserOpen((value) => !value);
  }

  // Auto-hiding behaviour for the collapsed notch: it peeks in, then
  // slides up + fades after 3s idle, hides immediately on scroll-down,
  // and slips back on scroll-up — out of the way while reading, back
  // when the user reaches for the top. Only armed while the pill is
  // collapsed (when expanded the notch is hidden regardless).
  const [notchVisible, setNotchVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!isEngaged || open) return;
    const scheduleHide = () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setNotchVisible(false), 3000);
    };
    // Peek in on (re-)collapse, then arm the idle timer. Deferred a frame
    // so we never setState synchronously inside the effect body.
    const raf = requestAnimationFrame(() => {
      setNotchVisible(true);
      scheduleHide();
    });

    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        lastY = y;
        if (delta > 4) {
          if (hideTimer.current) window.clearTimeout(hideTimer.current);
          setNotchVisible(false);
        } else if (delta < -4) {
          setNotchVisible(true);
          scheduleHide();
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [isEngaged, open]);

  // The notch only exists as the collapsed affordance; once the pill is
  // open the chevron is redundant, so it hides entirely.
  const notchShown = !open && notchVisible;

  if (!isEngaged) return null;

  return (
    <div
      className="pointer-events-auto relative flex flex-col items-center"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovering(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovering(false);
      }}
    >
      {/* Collapsible pill — grid-rows 0fr↔1fr animates height cleanly. */}
      <div
        className={cn(
          "grid",
          !reducedMotion &&
            "transition-[grid-template-rows] duration-300 ease-(--ease-premium)",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div
            inert={!open}
            className={cn(
              "flex w-[min(90vw,26rem)] items-center gap-2 rounded-full px-2 py-1.5 glass-surface",
              !reducedMotion &&
                "transition-[opacity,transform] duration-300 ease-(--ease-premium)",
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            )}
          >
            {/* Live equaliser glyph — pure CSS, dims + pauses when not playing. */}
            <span
              aria-hidden="true"
              className={cn(
                "ml-0.5 flex h-4 shrink-0 items-end gap-0.5 text-ring",
                !isPlaying &&
                  "opacity-40 [&_.eq-bar]:[animation-play-state:paused]",
              )}
            >
              <span className="eq-bar" style={{ ["--eq-order" as never]: 0 }} />
              <span className="eq-bar" style={{ ["--eq-order" as never]: 1 }} />
              <span className="eq-bar" style={{ ["--eq-order" as never]: 2 }} />
              <span className="eq-bar" style={{ ["--eq-order" as never]: 3 }} />
            </span>

            {/* Track identity — opens the full media-player dialog. */}
            <button
              type="button"
              onClick={openAudioPlayer}
              aria-label={t("expandLabel")}
              className={cn(
                "group flex min-w-0 flex-1 flex-col overflow-hidden rounded-md px-1.5 py-0.5 text-left",
                "transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/5",
                FOCUS_RING,
              )}
            >
              <span className="hidden truncate font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                {t("nowPlaying")}
              </span>
              <ScrollingTitle
                text={currentTrack?.title ?? t("noTrack")}
                reducedMotion={reducedMotion}
                className="text-xs font-medium text-foreground transition-colors group-hover:text-ring"
              />
              {currentTrack?.artist ? (
                <span className="block truncate text-[0.7rem] text-muted-foreground">
                  {currentTrack.artist}
                </span>
              ) : null}
            </button>

            {/* Inline transport. */}
            <div className="flex shrink-0 items-center gap-0.5 pl-0.5">
              <MiniButton
                label={t("prev")}
                onClick={prev}
                reducedMotion={reducedMotion}
              >
                <SkipBack className="size-4" />
              </MiniButton>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? t("pause") : t("play")}
                className={cn(
                  "grid size-9 place-items-center rounded-full bg-foreground text-background shadow-sm",
                  "transition-[transform,background-color] duration-(--motion-fast) ease-(--ease-premium) hover:bg-foreground/90",
                  !reducedMotion && "motion-safe:active:scale-90",
                  FOCUS_RING,
                )}
              >
                {isPlaying ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4 translate-x-px" />
                )}
              </button>
              <MiniButton
                label={t("next")}
                onClick={next}
                reducedMotion={reducedMotion}
              >
                <SkipForward className="size-4" />
              </MiniButton>
            </div>
          </div>
        </div>
      </div>

      {/* Notch / drawer handle — a full-width glass bar matching the pill,
       * hung absolutely off the dock's lower edge so it never reserves
       * layout space (no gap under the expanded pill). It is the collapsed
       * affordance only: hover, tap, or drag to expand. The auto-hide
       * engine slides it up + fades it out on scroll-down / idle, and a
       * header dropdown clears it via NAV_DROPDOWN_HIDE. */}
      <div className="pointer-events-none absolute inset-x-0 top-full flex justify-center">
        <button
          type="button"
          onPointerDown={onNotchDown}
          onPointerMove={onNotchMove}
          onClick={onNotchClick}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          inert={!notchShown}
          aria-expanded={open}
          aria-label={t("expandLabel")}
          className={cn(
            "pointer-events-auto mt-1 flex h-6 w-[min(90vw,26rem)] touch-none items-center justify-center rounded-full glass-surface text-muted-foreground hover:text-foreground",
            !reducedMotion &&
              "transition-[color,transform,opacity] duration-(--motion-fast) ease-(--ease-premium) motion-safe:active:scale-[0.98]",
            notchShown
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-2 opacity-0",
            NAV_DROPDOWN_HIDE,
            FOCUS_RING,
          )}
        >
          <ChevronUp aria-hidden="true" className="size-3.5" />
        </button>
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

/**
 * Audio HUD mounted once inside the header dock, hanging off its lower
 * edge. Renders the collapsible now-playing drawer: it auto-expands while
 * playing and collapses to a small notch when paused so transport stays
 * one gesture away. The dock animates its expand/collapse only when
 * motion is allowed.
 */
export function AudioNavBar() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-full z-10 flex justify-center">
      <NowPlayingDock reducedMotion={Boolean(reducedMotion)} />
    </div>
  );
}
