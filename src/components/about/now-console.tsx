"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, BookOpen, Film, Hammer, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";
import { profile } from "@/content/profile";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

/**
 * Per-channel chrome. `freq` is a decorative tuner readout (no real
 * meaning — it just sells the instrument metaphor). `ink` stays inside
 * the three-ink budget: ring / ring-2 / ring-3, never a fourth. Icons
 * mirror the existing CurrentlyCarouselCard so the two reads of the
 * same data stay visually consistent.
 */
const KIND_META = {
  building: { Icon: Hammer, freq: "88.1", ink: "text-ring", bar: "bg-ring" },
  reading: { Icon: BookOpen, freq: "92.7", ink: "text-ring-2", bar: "bg-ring-2" },
  listening: { Icon: Headphones, freq: "98.3", ink: "text-ring", bar: "bg-ring" },
  watching: { Icon: Film, freq: "104.5", ink: "text-ring-3", bar: "bg-ring-3" },
} as const;

type Kind = keyof typeof KIND_META;
const ORDER: readonly Kind[] = ["building", "reading", "listening", "watching"];

/** Deterministic per-bar keyframes — no Math.random, so SSR and the
 *  first client paint agree and there is no hydration drift. */
const EQ_BARS = [
  [0.35, 1, 0.5, 0.85, 0.4],
  [0.6, 0.4, 1, 0.55, 0.7],
  [0.45, 0.9, 0.6, 1, 0.5],
  [1, 0.5, 0.8, 0.45, 0.95],
  [0.5, 0.75, 0.4, 0.9, 0.6],
  [0.8, 0.45, 0.95, 0.6, 1],
  [0.4, 1, 0.55, 0.8, 0.45],
] as const;

type NowItem = { kind: string; label: string; detail?: string; url?: string };

interface NowConsoleProps {
  className?: string;
  /**
   * Status feed. Defaults to the static `profile.currently`; the About
   * page passes the live, admin-editable source through instead, so the
   * console always reflects the same data as the rest of the page.
   */
  items?: readonly NowItem[];
}

/**
 * An interactive "now" tuner. The four `profile.currently` kinds become
 * channels you tune between — click a segment, or arrow-key across the
 * tablist. The active channel cross-fades into the display; a signal
 * equalizer runs as the instrument's baseline, and `listening` gets a
 * now-playing scrubber plus an "on air" badge. Everything is built from
 * semantic tokens (theme-aware across all palettes) and degrades to a
 * static read under `prefers-reduced-motion`.
 */
export function NowConsole({ className, items = profile.currently }: NowConsoleProps) {
  const t = useTranslations("About.currently");
  const tNow = useTranslations("About.now");
  const reduceMotion = useReducedMotion();

  // Only render channels we actually have, in a stable canonical order.
  const channels = React.useMemo(
    () => ORDER.map((k) => items.find((i) => i.kind === k)).filter(Boolean) as NowItem[],
    [items],
  );

  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const count = channels.length;
  const canAuto = count > 1 && !reduceMotion;

  // Gentle auto-tune. Pauses on hover / focus-within so a reader is never
  // yanked off the channel they're looking at. Off entirely under
  // reduced-motion or with a single channel.
  React.useEffect(() => {
    if (!canAuto || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % count);
    }, 7000);
    return () => window.clearInterval(id);
  }, [canAuto, paused, count]);

  if (count === 0) {
    return (
      <section
        className={cn("glass-surface rounded-2xl p-5", className)}
        aria-label={tNow("ariaLabel")}
      >
        <ConsoleHeader index={0} count={0} live={false} />
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("empty")}</p>
      </section>
    );
  }

  const current = channels[active];
  const kind = current.kind as Kind;
  const meta = KIND_META[kind];
  const isListening = kind === "listening";

  const focusTab = (i: number) => {
    const next = (i + count) % count;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        focusTab(active + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        focusTab(active - 1);
        break;
      case "Home":
        e.preventDefault();
        focusTab(0);
        break;
      case "End":
        e.preventDefault();
        focusTab(count - 1);
        break;
    }
  };

  return (
    <section
      className={cn("glass-surface group/console flex flex-col rounded-2xl p-5", className)}
      aria-label={tNow("ariaLabel")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ConsoleHeader index={active} count={count} live />

      {/* Display — inset readout panel with a faint scanline wash. */}
      <div
        role="tabpanel"
        id={`now-panel-${active}`}
        aria-live="polite"
        className="relative mt-4 flex flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-background/40 p-4"
      >
        {/* Scanline texture: purely decorative, theme-tinted, cheap. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-luminosity motion-reduce:opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, var(--foreground) 0, var(--foreground) 1px, transparent 1px, transparent 3px)",
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative z-10"
          >
            <div className="flex items-center gap-2">
              <meta.Icon aria-hidden="true" className={cn("size-3.5 shrink-0", meta.ink)} />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
                {t(`kinds.${kind}`)}
              </span>
              <span className="font-mono text-[0.6rem] tabular-nums tracking-[0.18em] text-muted-foreground/70">
                {meta.freq}
                <span className="text-muted-foreground/40"> FM</span>
              </span>
              {isListening ? <OnAir label={tNow("onAir")} reduce={!!reduceMotion} /> : null}
            </div>

            <p className="mt-2 min-h-10 text-balance text-lg font-semibold leading-snug text-foreground">
              {current.label}
            </p>

            {current.detail ? (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{current.detail}</p>
            ) : null}

            {current.url ? (
              <a
                href={current.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group/link mt-2 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground underline-offset-4 hover:underline",
                  FOCUS_RING_INSET,
                )}
              >
                {t("open")}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-(--motion-fast) group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              </a>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* Signal baseline. The scrubber rides above it for `listening`. */}
        <div className="relative z-10 mt-auto flex items-end justify-between gap-3 pt-4">
          <Equalizer barClass={meta.bar} reduce={!!reduceMotion} energetic={isListening} />
          {isListening ? <Scrubber reduce={!!reduceMotion} /> : null}
        </div>
      </div>

      {/* Tuner — the channel selector. */}
      <div
        role="tablist"
        aria-label={tNow("ariaLabel")}
        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {channels.map((ch, i) => {
          const k = ch.kind as Kind;
          const m = KIND_META[k];
          const selected = i === active;
          return (
            <button
              key={k}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`now-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={onTabKeyDown}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                FOCUS_RING_INSET,
                selected
                  ? "border-ring/60 bg-card text-foreground shadow-sm"
                  : "border-border/60 bg-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <m.Icon
                aria-hidden="true"
                className={cn("size-3.5 shrink-0", selected ? m.ink : "text-current")}
              />
              <span className="truncate">{t(`kinds.${k}`)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConsoleHeader({
  index,
  count,
  live,
}: {
  index: number;
  count: number;
  live: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="relative grid size-2 place-items-center">
          {live ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-signal/60 motion-reduce:hidden" />
          ) : null}
          <span
            className={cn(
              "relative size-2 rounded-full",
              live ? "bg-signal" : "bg-muted-foreground/40",
            )}
          />
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          /now
        </span>
      </div>
      <span className="font-mono text-[0.6rem] tabular-nums tracking-[0.2em] text-muted-foreground/70">
        {`CH ${count === 0 ? "00" : String(index + 1).padStart(2, "0")} · ${String(count).padStart(2, "0")}`}
      </span>
    </header>
  );
}

function OnAir({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-signal/40 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-signal">
      <span aria-hidden="true" className="relative grid size-1.5 place-items-center">
        {!reduce ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-signal/70" />
        ) : null}
        <span className="relative size-1.5 rounded-full bg-signal" />
      </span>
      {label}
    </span>
  );
}

function Equalizer({
  barClass,
  reduce,
  energetic,
}: {
  barClass: string;
  reduce: boolean;
  energetic: boolean;
}) {
  // Fewer, calmer bars when the channel isn't `listening`.
  const bars = energetic ? EQ_BARS : EQ_BARS.slice(0, 5);
  return (
    <div aria-hidden="true" className="flex h-6 items-end gap-0.75">
      {bars.map((frames, i) => {
        const peak = frames[2];
        if (reduce) {
          return (
            <span
              key={i}
              className={cn("w-0.75 rounded-full opacity-70", barClass)}
              style={{ height: `${Math.round(peak * 100)}%` }}
            />
          );
        }
        return (
          <motion.span
            key={i}
            className={cn("w-0.75 origin-bottom rounded-full opacity-80", barClass)}
            style={{ height: "100%" }}
            initial={{ scaleY: frames[0] }}
            animate={{ scaleY: [...frames] }}
            transition={{
              duration: energetic ? 1.1 : 2.2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
              delay: i * 0.08,
            }}
          />
        );
      })}
    </div>
  );
}

function Scrubber({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative h-0.75 flex-1 overflow-hidden rounded-full bg-border">
      {reduce ? (
        <span className="absolute inset-y-0 left-0 w-[42%] rounded-full bg-ring" />
      ) : (
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-ring"
          initial={{ width: "8%" }}
          animate={{ width: ["8%", "100%"] }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity }}
        />
      )}
    </div>
  );
}
