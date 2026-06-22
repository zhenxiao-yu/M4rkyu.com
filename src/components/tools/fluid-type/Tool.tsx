"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampNumber, parseFloatSafe } from "@/components/tools/_shared/number";
import { buildFluidType, resolveFluidPx } from "@/lib/tools/fluid-type";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// Fluid-typography clamp() generator. The clamp math lives in the pure,
// unit-tested @/lib/tools/fluid-type so the preview, CSS declaration, and
// copied value never drift. Numeric fields are NaN-safe (parseFloatSafe +
// clampNumber) and the degenerate equal-viewport case (which would divide by
// zero in the slope) is caught in buildFluidType — the UI shows a hint and
// falls back to a flat, valid clamp instead of rendering Infinityvw / NaNrem.

const ROOT_PX = 16;

interface State {
  minFont: number;
  maxFont: number;
  minVw: number;
  maxVw: number;
}

const INITIAL: State = { minFont: 16, maxFont: 40, minVw: 360, maxVw: 1280 };

interface FieldDef {
  key: keyof State;
  /** Translation key under Tools.fluidType.fields. */
  i18n: string;
  unit: "px";
  min: number;
  max: number;
}

const FIELDS: FieldDef[] = [
  { key: "minFont", i18n: "minFont", unit: "px", min: 0, max: 400 },
  { key: "maxFont", i18n: "maxFont", unit: "px", min: 0, max: 400 },
  { key: "minVw", i18n: "minVw", unit: "px", min: 0, max: 5000 },
  { key: "maxVw", i18n: "maxVw", unit: "px", min: 0, max: 5000 },
];

export function FluidType() {
  const t = useTranslations("Tools.fluidType");
  const tc = useTranslations("Tools.common");
  const [state, setState] = useState<State>(INITIAL);
  const [previewVw, setPreviewVw] = useState(768);

  const result = buildFluidType({ ...state, base: ROOT_PX });
  const css = `font-size: ${result.clamp};`;

  // Keep the preview slider inside the (possibly reordered) viewport bounds.
  const vwLo = Math.min(state.minVw, state.maxVw);
  const vwHi = Math.max(state.minVw, state.maxVw);
  const safePreviewVw = clampNumber(previewVw, vwLo, vwHi);
  const resolvedPx = resolveFluidPx(result, safePreviewVw, state.minFont, state.maxFont);

  function setField(key: keyof State, value: number) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-4">
        {/* Live preview at the simulated viewport. A literal clamp() would
            track the real window, so we resolve the size ourselves. */}
        <div className="grid gap-3 rounded-md border border-border/60 bg-background/40 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{t("preview")}</span>
            <span className="tabular-nums">
              {safePreviewVw}px → {resolvedPx}px
            </span>
          </div>
          <p
            className="wrap-break-word font-display font-semibold leading-tight text-foreground"
            style={{ fontSize: `${resolvedPx}px` }}
          >
            {t("specimen")}
          </p>
          <input
            type="range"
            min={vwLo}
            max={vwHi}
            value={safePreviewVw}
            onChange={(event) => setPreviewVw(Number(event.target.value))}
            aria-label={t("simulatedViewport")}
            className={cn(
              "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
              FOCUS_RING,
            )}
          />
        </div>

        {/* clamp() output. break-all so a long value never overflows at 360px. */}
        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 break-all rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs">
              {css}
            </code>
            <CopyButton value={css} label="CSS" className="shrink-0" />
          </div>
        </div>

        {!result.ok ? (
          <p
            role="status"
            className="font-mono text-[0.65rem] leading-relaxed text-warning"
          >
            {t("equalViewportsHint")}
          </p>
        ) : null}

        <p className="font-mono text-[0.6rem] leading-relaxed text-muted-foreground">
          {t("rootHint")}
        </p>
      </div>

      <div className="grid min-w-0 content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {FIELDS.map((field) => (
          <NumberField
            key={field.key}
            label={t(`fields.${field.i18n}`)}
            value={state[field.key]}
            unit={field.unit}
            min={field.min}
            max={field.max}
            onChange={(value) => setField(field.key, value)}
          />
        ))}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  // Local draft so a half-typed value (e.g. "" or "1.") doesn't snap to the
  // clamped number mid-edit; commit + clamp on change/blur only.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    onChange(clampNumber(parseFloatSafe(raw, value), min, max));
    setDraft(null);
  }

  return (
    <label htmlFor={id} className="grid gap-1.5">
      <span className="flex items-baseline justify-between gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <span aria-hidden="true">{unit}</span>
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        spellCheck={false}
        autoComplete="off"
        className={cn("min-w-0 font-mono text-sm tabular-nums", FOCUS_RING_INSET)}
      />
    </label>
  );
}
