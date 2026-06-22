"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { buildBoxShadow } from "@/lib/tools/shadow";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// CSS box-shadow generator. Native range + number inputs (no shadcn slider
// needed); the shadow string is assembled by the pure, unit-tested
// buildBoxShadow in @/lib/tools/shadow so the preview and copy value never
// drift. Numeric fields are NaN-safe (clampInt) and the color is a free-form
// CSS color string, so the output is always a valid box-shadow.

interface ShadowState {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const INITIAL: ShadowState = {
  x: 0,
  y: 12,
  blur: 32,
  spread: -8,
  color: "rgba(15, 23, 42, 0.25)",
  inset: false,
};

const RANGES = {
  x: { min: -50, max: 50 },
  y: { min: -50, max: 50 },
  blur: { min: 0, max: 100 },
  spread: { min: -30, max: 30 },
} as const;

type NumericKey = keyof typeof RANGES;

export function ShadowGenerator() {
  const t = useTranslations("Tools.shadowGenerator");
  const tc = useTranslations("Tools.common");
  const [state, setState] = useState<ShadowState>(INITIAL);

  const shadow = buildBoxShadow(state);
  const css = `box-shadow: ${shadow};`;

  function setNumber(key: NumericKey, value: number) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-5 rounded-md border border-border/60 bg-background/40 p-5 sm:p-8">
        <div className="grid place-items-center">
          <div
            role="img"
            aria-label={t("preview")}
            className="size-32 w-full max-w-52 rounded-xl bg-card sm:size-52"
            style={{ boxShadow: shadow }}
          />
        </div>
        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs">
              {css}
            </code>
            <CopyButton value={css} label="CSS" className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        {(Object.keys(RANGES) as NumericKey[]).map((key) => (
          <SliderRow
            key={key}
            label={t(`fields.${key}`)}
            value={state[key]}
            min={RANGES[key].min}
            max={RANGES[key].max}
            onChange={(value) => setNumber(key, value)}
            unit="px"
          />
        ))}

        <ColorField
          label={t("fields.color")}
          hint={t("colorHint")}
          value={state.color}
          onChange={(color) => setState((prev) => ({ ...prev, color }))}
        />

        <label
          className={cn(
            "flex min-h-9 cursor-pointer items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm",
            FOCUS_RING_INSET,
          )}
        >
          <input
            type="checkbox"
            checked={state.inset}
            onChange={(event) =>
              setState((prev) => ({ ...prev, inset: event.target.checked }))
            }
            className="size-4 rounded border-border accent-ring"
          />
          <span>{t("fields.inset")}</span>
        </label>
      </div>
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
  // Local draft so a half-typed value (e.g. "-" or "") doesn't snap to the
  // clamped number mid-edit; commit + clamp on change/blur only.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    const next = clampInt(raw, min, max, value);
    onChange(next);
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
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
          FOCUS_RING,
        )}
      />
    </div>
  );
}

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  // The native color picker only understands 6-digit hex; show it as a swatch
  // and only push a value when it parses, so an rgba()/var() text value isn't
  // clobbered just by opening the picker.
  const hexForPicker = /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : "#000000";

  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hexForPicker}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className={cn(
            "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1",
            FOCUS_RING_INSET,
          )}
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label={label}
          className="min-w-0 font-mono text-xs"
        />
      </div>
      <p className="text-[0.65rem] text-muted-foreground/70">{hint}</p>
    </div>
  );
}
