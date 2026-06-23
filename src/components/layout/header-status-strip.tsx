"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAudioPlayer } from "@/lib/audio/audio-player-context";
import { useAudioToggle } from "@/lib/audio/use-audio-toggle";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Instrument status strip — the thin HUD band above the glass dock.
 * Left: locale + region. Centre: the now-playing transport (the desktop
 * music control) — equalizer, prev / play-pause / next, and a hover track
 * menu. Right: a Toronto clock + system pulse. Framed with corner ticks.
 *
 * Placed above HeaderDock inside the sticky <header>; `<main>` is pulled up
 * by `--dock-h` only, so the dock still overlaps the hero by that much and
 * this band sits in the top gutter. Desktop-only (sm+); on mobile the rails
 * open the full AudioPlayerDialog instead.
 */

const emptySubscribe = () => () => {};
// false during SSR + the first client render, true thereafter — no effect
// setState, so it satisfies react-hooks/set-state-in-effect.
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

const SEP = (
  <span aria-hidden="true" className="text-hud-muted/40">
    /
  </span>
);

function CornerTick({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-2 w-2 shrink-0 border-hud-muted/45",
        side === "left" ? "border-l border-t" : "border-r border-t",
      )}
    />
  );
}

function Equalizer({ active }: { active: boolean }) {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = mounted && reduceMotion;
  const bars = [0, 1, 2];
  return (
    <span aria-hidden="true" className="inline-flex h-2.5 items-end gap-[2px]">
      {bars.map((i) => (
        <motion.span
          key={i}
          className={cn(
            "w-[2px] origin-bottom rounded-full",
            active ? "bg-ring" : "bg-hud-muted/50",
          )}
          style={{ height: "100%" }}
          initial={false}
          animate={
            active && !shouldReduceMotion
              ? { scaleY: [0.3, 1, 0.45, 0.85, 0.3] }
              : { scaleY: active ? 0.7 : 0.3 }
          }
          transition={
            active && !shouldReduceMotion
              ? {
                  duration: 0.9 + i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}

const TRANSPORT_BTN = cn(
  "inline-flex size-5 items-center justify-center rounded-sm text-hud-muted transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
  FOCUS_RING,
);

function Transport() {
  const ta = useTranslations("AudioPlayer");
  const { tracks, currentTrack, isPlaying, next, prev, setDialogOpen } =
    useAudioPlayer();
  const { toggle } = useAudioToggle();
  // The track index is seeded from localStorage, so it differs between the
  // server (default 0) and the client's first render. Defer any index-derived
  // text/state to after mount so hydration matches. useSyncExternalStore gives
  // a clean false-on-server / true-on-client signal with no effect setState.
  const mounted = useMounted();
  if (tracks.length === 0) return null;

  return (
    <span className="pointer-events-auto hidden items-center gap-1 lg:flex">
      <button
        type="button"
        onClick={prev}
        aria-label={ta("prev")}
        className={TRANSPORT_BTN}
      >
        <SkipBack aria-hidden="true" className="size-3" />
      </button>
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? ta("pause") : ta("play")}
        className={cn(TRANSPORT_BTN, isPlaying && "text-foreground")}
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-3" />
        ) : (
          <Play aria-hidden="true" className="size-3 translate-x-px" />
        )}
      </button>
      <button
        type="button"
        onClick={next}
        aria-label={ta("next")}
        className={TRANSPORT_BTN}
      >
        <SkipForward aria-hidden="true" className="size-3" />
      </button>

      {/* Now-playing title — opens the shared player modal. The dialog
       * owns the playlist + extended controls, so the HUD stays a quick
       * transport (no duplicate hover playlist). */}
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "flex max-w-[18rem] items-center gap-1.5 rounded-sm px-1 normal-case tracking-normal transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
          FOCUS_RING,
        )}
      >
        {!mounted ? (
          <span className="text-hud-muted/40">—</span>
        ) : currentTrack ? (
          <>
            <span className="truncate text-foreground/75">
              {currentTrack.title}
            </span>
            <span className="hidden truncate text-hud-muted xl:inline">
              — {currentTrack.artist}
            </span>
          </>
        ) : (
          <span className="uppercase tracking-[0.2em] text-hud-muted/70">
            {ta("noTrack")}
          </span>
        )}
        {/* The visible track title forms the accessible name (WCAG 2.5.3);
         * this sr-only suffix conveys the button's purpose without an
         * aria-label that would override that visible text. */}
        <span className="sr-only">{ta("openLabel")}</span>
      </button>
    </span>
  );
}

function Clock() {
  const [time, setTime] = useState<{ hms: string; zone: string } | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
    const tick = () => {
      const parts = fmt.formatToParts(new Date());
      const get = (t: Intl.DateTimeFormatPartTypes) =>
        parts.find((p) => p.type === t)?.value ?? "";
      setTime({
        hms: `${get("hour")}:${get("minute")}:${get("second")}`,
        zone: get("timeZoneName") || "EST",
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="tabular-nums tracking-[0.12em] text-foreground/70">
        {time?.hms ?? "--:--:--"}
      </span>
      <span className="text-hud-muted/70">{time?.zone ?? "EST"}</span>
    </span>
  );
}

function SystemDot() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = mounted && reduceMotion;
  return (
    <span aria-hidden="true" className="relative grid size-1.5 place-items-center">
      <span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_var(--terminal-glow)]" />
      {!shouldReduceMotion ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-success"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2.6 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
    </span>
  );
}

/**
 * Live site coordinate — the HUD's "you are here". Reads the locale-
 * stripped pathname and renders the current section (and detail slug, if
 * any) as an instrument readout: `▸ WORK · NIMBUS`. The container is
 * uppercase + mono, so this inherits the HUD voice; the accent caret is
 * the only colour. Animates a quick rise on route change (motion-safe),
 * so navigating feels like the instrument re-locking onto a position.
 */
function NavCoordinate() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = mounted && reduceMotion;
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(0, 2);
  const label = segments.length
    ? segments.map((s) => s.replace(/-/g, " ")).join(" · ")
    : "home";
  return (
    <span className="inline-flex max-w-[15rem] items-center gap-1.5 overflow-hidden">
      <span aria-hidden="true" className="text-ring">
        ▸
      </span>
      <motion.span
        key={label}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
        className="truncate text-foreground/70"
      >
        {label}
      </motion.span>
    </span>
  );
}

export function HeaderStatusStrip({ locale }: { locale: Locale }) {
  const t = useTranslations("Hud");
  const { isPlaying, currentTrack } = useAudioPlayer();
  const playing = isPlaying && !!currentTrack;

  return (
    <div className="glass-blur pointer-events-auto relative hidden h-7 w-full items-center justify-between gap-4 border-b border-border/40 bg-background/55 px-3 font-mono text-[0.6rem] uppercase leading-none tracking-[0.2em] text-hud-muted sm:flex sm:px-5 lg:px-6">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent"
      />

      {/* Left — locale + region */}
      <span className="flex items-center gap-2.5">
        <CornerTick side="left" />
        <span className="text-hud-muted/70">LOC</span>
        <span className="text-foreground/70">{locale.toUpperCase()}</span>
        <span className="hidden lg:flex lg:items-center lg:gap-2.5">
          {SEP}
          <span className="text-hud-muted">{t("region")}</span>
        </span>
        {/* Live site coordinate — md+ has room beside the centre transport. */}
        <span className="hidden md:flex md:items-center md:gap-2.5">
          {SEP}
          <NavCoordinate />
        </span>
      </span>

      {/* Centre — now-playing transport (md: display, lg: full controls) */}
      <span className="hidden min-w-0 items-center gap-2 md:flex">
        <Equalizer active={playing} />
        <span className="hidden text-hud-muted/60 lg:inline">
          {playing ? t("nowPlaying") : t("standby")}
        </span>
        <Transport />
      </span>

      {/* Right — system pulse + clock */}
      <span className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5" title={t("systemStatus")}>
          <SystemDot />
          <span className="hidden text-hud-muted/70 sm:inline">OK</span>
        </span>
        {SEP}
        <Clock />
        <CornerTick side="right" />
      </span>
    </div>
  );
}
