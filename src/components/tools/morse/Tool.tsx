"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { runMorse, type MorseMode } from "@/lib/tools/morse";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

const MODES = ["encode", "decode"] as const;

// Beep timing in seconds (relative dit-length units, ITU-ish: dah = 3 dits,
// inter-symbol = 1 dit, inter-letter = 3 dits, inter-word = 7 dits).
const DIT = 0.09;
const FREQ = 620; // Hz — a soft sine, not a piercing square wave.

type Beep = { at: number; dur: number };

/** Turn a morse string ("... --- ...", "/" word breaks) into scheduled beeps. */
function scheduleBeeps(morse: string): { beeps: Beep[]; total: number } {
  const beeps: Beep[] = [];
  let cursor = 0;
  for (const token of morse.replace(/\n/g, " ").split(/(\s+|\/)/)) {
    if (token === "/" || /^\s+$/.test(token)) {
      cursor += token.includes("/") ? 7 * DIT : 3 * DIT;
      continue;
    }
    for (const symbol of token) {
      if (symbol === ".") {
        beeps.push({ at: cursor, dur: DIT });
        cursor += DIT;
      } else if (symbol === "-") {
        beeps.push({ at: cursor, dur: 3 * DIT });
        cursor += 3 * DIT;
      }
      cursor += DIT; // inter-symbol gap
    }
  }
  return { beeps, total: cursor };
}

export function Morse() {
  const t = useTranslations("Tools.morse");
  const tc = useTranslations("Tools.common");
  const [mode, setMode] = useState<MorseMode>("encode");
  const [input, setInput] = useState("hello world");
  const [playing, setPlaying] = useState(false);

  const result = useMemo(() => runMorse(input, mode), [input, mode]);

  // The dot/dash string we can audibly play, regardless of mode: in decode
  // mode the *input* is already morse; in encode mode the output is.
  const playableMorse = mode === "encode" ? result.output : input;
  const canPlay = playableMorse.trim().length > 0;

  const audioRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(false);
  }, []);

  // Tear down audio on unmount (cleanup-only — never sets state in the body).
  useEffect(() => () => stopRef.current?.(), []);

  // Editing the input or flipping mode invalidates any in-flight playback, so
  // stop it from the change handlers rather than chasing the value in an effect.
  const handleInput = useCallback(
    (value: string) => {
      stop();
      setInput(value);
    },
    [stop],
  );
  const handleMode = useCallback(
    (next: MorseMode) => {
      stop();
      setMode(next);
    },
    [stop],
  );

  const play = useCallback(() => {
    if (!canPlay) return;
    if (playing) {
      stop();
      return;
    }
    const Ctor =
      typeof window !== "undefined"
        ? (window.AudioContext ??
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)
        : undefined;
    if (!Ctor) return; // No Web Audio support — fail soft, button just no-ops.

    const ctx = audioRef.current ?? new Ctor();
    audioRef.current = ctx;
    void ctx.resume();

    const { beeps, total } = scheduleBeeps(playableMorse);
    if (beeps.length === 0) return;

    const start = ctx.currentTime + 0.05;
    const oscillators: OscillatorNode[] = [];
    for (const beep of beeps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = FREQ;
      // Tiny ramps avoid clicks at note edges.
      const t0 = start + beep.at;
      const t1 = t0 + beep.dur;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.18, t0 + 0.005);
      gain.gain.setValueAtTime(0.18, Math.max(t0 + 0.005, t1 - 0.005));
      gain.gain.linearRampToValueAtTime(0, t1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t1);
      oscillators.push(osc);
    }

    const endTimer = window.setTimeout(
      () => setPlaying(false),
      (total + 0.1) * 1000,
    );
    stopRef.current = () => {
      window.clearTimeout(endTimer);
      for (const osc of oscillators) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped — ignore.
        }
      }
    };
    setPlaying(true);
  }, [canPlay, playing, playableMorse, stop]);

  const empty = result.empty;
  const PlayIcon = playing ? Pause : Play;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label={t("modeLabel")}
          className="inline-flex min-w-0 rounded-md border border-border bg-card/40 p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => handleMode(m)}
              className={cn(
                "min-h-9 rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.15em]",
                "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                FOCUS_RING_INSET,
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={play}
          disabled={!canPlay}
          aria-pressed={playing}
          aria-label={playing ? t("stop") : t("play")}
          className={cn("ml-auto min-h-9", FOCUS_RING)}
        >
          <PlayIcon className="size-3.5" aria-hidden="true" />
          {playing ? t("stop") : t("play")}
        </Button>
        <CopyButton
          value={result.output}
          label="morse"
          disabled={empty}
          className="min-h-9"
        >
          {tc("copy")}
        </CopyButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          rows={6}
          spellCheck={false}
          aria-label={mode === "encode" ? t("inputAriaEncode") : t("inputAriaDecode")}
          placeholder={mode === "encode" ? t("placeholderEncode") : t("placeholderDecode")}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-sm break-all whitespace-pre-wrap",
            FOCUS_RING_INSET,
          )}
        />
        <textarea
          readOnly
          value={empty ? "" : result.output}
          rows={6}
          aria-label={mode === "encode" ? t("outputAriaEncode") : t("outputAriaDecode")}
          aria-live="polite"
          placeholder={tc("emptyHint")}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-sm break-all whitespace-pre-wrap",
            FOCUS_RING_INSET,
          )}
        />
      </div>

      <p className="text-xs text-muted-foreground/70">{t("hint")}</p>
    </div>
  );
}
