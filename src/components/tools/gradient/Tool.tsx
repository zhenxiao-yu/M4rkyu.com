"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import {
  buildGradient,
  type GradientStop,
  type GradientType,
} from "@/lib/tools/gradient";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

const TYPES: GradientType[] = ["linear", "radial", "conic"];
const MIN_STOPS = 2;
const MAX_STOPS = 6;

interface Stop extends GradientStop {
  /** Stable identity so list keys survive reorder/remove + focus restores. */
  id: string;
}

let stopSeq = 0;
function makeStop(color: string, pos: number): Stop {
  stopSeq += 1;
  return { id: `stop-${stopSeq}`, color, pos };
}

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

export function GradientGenerator() {
  const t = useTranslations("Tools.gradient");
  const tc = useTranslations("Tools.common");
  const tablistId = useId();

  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>(() => [
    makeStop("#7c3aed", 0),
    makeStop("#22d3ee", 100),
  ]);
  // Raw position text per stop, keyed by id, so a user can clear the field
  // or type mid-value without the number being clobbered on every keystroke.
  // Absent key = field mirrors the committed numeric position.
  const [posDraft, setPosDraft] = useState<Record<string, string>>({});

  // Focus targets for after a remove: restore to the next add/remove anchor.
  const addRef = useRef<HTMLButtonElement>(null);

  const gradientCss = useMemo(
    () => buildGradient(type, angle, stops),
    [type, angle, stops],
  );
  const cssDeclaration = `background: ${gradientCss};`;
  const angled = type !== "radial";

  function patchColor(id: string, color: string) {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, color } : s)));
  }

  function patchPos(id: string, raw: string) {
    // Keep the raw text for the field; commit a NaN-safe clamped int to the
    // gradient so the preview/output can never receive NaN%.
    setPosDraft((prev) => ({ ...prev, [id]: raw }));
    const pos = clampInt(raw, 0, 100, 0);
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, pos } : s)));
  }

  function commitPos(id: string) {
    // On blur, drop the draft so the field snaps to the canonical 0–100 value.
    setPosDraft((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function addStop() {
    setStops((prev) =>
      prev.length >= MAX_STOPS ? prev : [...prev, makeStop("#ffffff", 50)],
    );
  }

  function removeStop(id: string) {
    setStops((prev) => {
      if (prev.length <= MIN_STOPS) return prev;
      return prev.filter((s) => s.id !== id);
    });
    setPosDraft((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // The removed row's controls vanish; park focus on the stable Add button
    // so keyboard users aren't dropped back to <body>.
    addRef.current?.focus();
  }

  function randomize() {
    const n = MIN_STOPS + Math.floor(Math.random() * (MAX_STOPS - MIN_STOPS));
    setStops(
      Array.from({ length: n }, (_, i) =>
        makeStop(randomHex(), Math.round((i / (n - 1)) * 100)),
      ),
    );
    setPosDraft({});
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* Preview + output */}
      <div className="grid min-w-0 gap-3">
        <div
          role="img"
          aria-label={t("previewAlt")}
          className="aspect-video w-full rounded-lg border border-border"
          style={{ background: gradientCss }}
        />
        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs break-all">
              {cssDeclaration}
            </code>
            <CopyButton value={cssDeclaration} label={t("cssLabel")} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid content-start gap-3">
        <div
          role="tablist"
          aria-label={t("typeLabel")}
          className="inline-flex rounded-md border border-border bg-card/40 p-0.5"
        >
          {TYPES.map((value) => {
            const selected = type === value;
            return (
              <button
                key={value}
                id={`${tablistId}-${value}`}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setType(value)}
                className={cn(
                  "flex-1 rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] motion-safe:transition-colors",
                  FOCUS_RING_INSET,
                  selected
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(`type.${value}`)}
              </button>
            );
          })}
        </div>

        {angled ? (
          <div className="grid gap-1.5">
            <label
              htmlFor={`${tablistId}-angle`}
              className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span>{t("angle")}</span>
              <span className="tabular-nums">{angle}°</span>
            </label>
            <input
              id={`${tablistId}-angle`}
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(clampInt(e.target.value, 0, 360, 0))}
              aria-label={t("angle")}
              className={cn(
                "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
                FOCUS_RING,
              )}
            />
          </div>
        ) : null}

        <div className="grid gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("stops")}
          </span>
          {stops.map((stop, i) => (
            <div
              key={stop.id}
              className="flex flex-wrap items-center gap-2 min-w-0"
            >
              <input
                type="color"
                value={stop.color}
                onChange={(e) => patchColor(stop.id, e.target.value)}
                aria-label={t("stopColor", { n: i + 1 })}
                className={cn(
                  "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5",
                  FOCUS_RING,
                )}
              />
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                value={posDraft[stop.id] ?? stop.pos}
                onChange={(e) => patchPos(stop.id, e.target.value)}
                onBlur={() => commitPos(stop.id)}
                aria-label={t("stopPosition", { n: i + 1 })}
                className="h-9 w-16 font-mono text-xs"
              />
              <span aria-hidden="true" className="text-xs text-muted-foreground">
                %
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeStop(stop.id)}
                disabled={stops.length <= MIN_STOPS}
                aria-label={t("removeStop", { n: i + 1 })}
                className="ml-auto size-9 px-0"
              >
                <X className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            ref={addRef}
            type="button"
            size="sm"
            variant="outline"
            onClick={addStop}
            disabled={stops.length >= MAX_STOPS}
            className="min-h-9"
          >
            <Plus className="size-3.5" aria-hidden="true" /> {t("addStop")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={randomize}
            className="min-h-9"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" /> {t("random")}
          </Button>
        </div>
      </div>
    </div>
  );
}
