"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { buildBoxModelCss, outerSize, type BoxModel as BoxModelValues } from "@/lib/tools/box-model";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// Interactive CSS box-model visualizer. Each layer (margin → border → padding
// → content) is driven by a NaN-safe slider + number pair; the CSS string and
// the outer geometry are assembled by the pure, unit-tested helpers in
// @/lib/tools/box-model so the preview and copy value never drift. The nested
// layer divs are decorative (aria-hidden) — the controls carry the labels and
// values, so the visualization is fully described to assistive tech.

const INITIAL: BoxModelValues = {
  width: 200,
  height: 100,
  padding: 16,
  border: 4,
  margin: 16,
};

const RANGES = {
  width: { min: 50, max: 400 },
  height: { min: 20, max: 300 },
  padding: { min: 0, max: 80 },
  border: { min: 0, max: 20 },
  margin: { min: 0, max: 80 },
} as const;

type Field = keyof typeof RANGES;

const FIELD_ORDER: readonly Field[] = ["width", "height", "padding", "border", "margin"];

export function BoxModel() {
  const t = useTranslations("Tools.boxModel");
  const tc = useTranslations("Tools.common");
  const [state, setState] = useState<BoxModelValues>(INITIAL);

  const css = buildBoxModelCss(state);
  const outer = outerSize(state);

  function setField(key: Field, value: number) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-5 rounded-md border border-border/60 bg-background/40 p-4 sm:p-6">
        <div className="grid min-w-0 place-items-center overflow-x-auto">
          {/* Decorative: every value is exposed through the labelled controls. */}
          <div aria-hidden="true" className="max-w-full">
            <Layer label={t("margin")} className="bg-muted/60" pad={state.margin}>
              <Layer label={t("border")} className="bg-ring-3/30" pad={state.border}>
                <Layer label={t("padding")} className="bg-ring-2/25" pad={state.padding}>
                  <div
                    className="grid max-w-full place-items-center bg-ring/30 font-mono text-[0.7rem] text-foreground"
                    style={{ width: state.width, height: state.height }}
                  >
                    {t("content")}
                  </div>
                </Layer>
              </Layer>
            </Layer>
          </div>
        </div>
        <p className="text-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("outer", { width: outer.width, height: outer.height })}
        </p>

        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-[0.7rem] leading-5">
              {css}
            </pre>
            <CopyButton value={css} label="CSS" className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        {FIELD_ORDER.map((key) => (
          <SliderRow
            key={key}
            label={t(key)}
            value={state[key]}
            min={RANGES[key].min}
            max={RANGES[key].max}
            onChange={(value) => setField(key, value)}
            unit="px"
          />
        ))}
      </div>
    </div>
  );
}

function Layer({
  label,
  className,
  pad,
  children,
}: {
  label: string;
  className: string;
  pad: number;
  children: ReactNode;
}) {
  return (
    <div className={cn("relative max-w-full", className)} style={{ padding: pad }}>
      <span className="absolute left-1 top-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  const id = useId();
  // Local draft so a half-typed value (e.g. "" mid-edit) doesn't snap to the
  // clamped number; commit + clamp on change/blur only.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    onChange(clampInt(raw, min, max, value));
    setDraft(null);
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={draft ?? String(value)}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={(event) => commit(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            aria-label={label}
            className={cn(
              "w-12 rounded-sm bg-transparent text-right font-mono text-xs tabular-nums",
              FOCUS_RING_INSET,
            )}
          />
          {unit ? (
            <span className="font-mono text-xs text-muted-foreground">{unit}</span>
          ) : null}
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clampInt(event.target.value, min, max, value))}
        aria-label={label}
        className={cn(
          "h-9 w-full cursor-pointer appearance-none bg-transparent accent-ring",
          "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted",
          "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted",
          FOCUS_RING,
        )}
      />
    </div>
  );
}
