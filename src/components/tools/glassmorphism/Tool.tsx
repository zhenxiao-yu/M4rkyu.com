"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt, clampNumber } from "@/components/tools/_shared/number";
import { buildGlassCss, buildGlassValues } from "@/lib/tools/glassmorphism";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// Glassmorphism CSS generator. Native range + number inputs (no shadcn slider
// needed); the declarations are assembled by the pure, unit-tested
// buildGlassValues/buildGlassCss in @/lib/tools/glassmorphism so the preview and
// copy value never drift. Numeric fields are NaN-safe (clampInt/clampNumber) so
// non-numeric input can't inject NaN, and the output is always valid CSS.

interface GlassState {
  blur: number;
  saturation: number;
  bgAlpha: number; // 0–1
  borderAlpha: number; // 0–1
  radius: number;
  color: string;
}

const INITIAL: GlassState = {
  blur: 14,
  saturation: 180,
  bgAlpha: 0.25,
  borderAlpha: 0.18,
  radius: 16,
  color: "#ffffff",
};

// px-valued sliders.
const PX_RANGES = {
  blur: { min: 0, max: 40 },
  radius: { min: 0, max: 48 },
} as const;

type PxKey = keyof typeof PX_RANGES;

export function Glassmorphism() {
  const t = useTranslations("Tools.glassmorphism");
  const tc = useTranslations("Tools.common");
  const [state, setState] = useState<GlassState>(INITIAL);

  const values = buildGlassValues(state);
  const css = buildGlassCss(state);

  function setPx(key: PxKey, value: number) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  const previewStyle: React.CSSProperties = {
    background: values.background,
    backdropFilter: values.backdropFilter,
    WebkitBackdropFilter: values.backdropFilter,
    border: values.border,
    borderRadius: values.borderRadius,
  };

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-5 rounded-md border border-border/60 bg-background/40 p-5 sm:p-8">
        <div
          role="img"
          aria-label={t("preview")}
          className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-lg p-4 sm:p-6"
          style={{
            background:
              "linear-gradient(135deg, var(--ring) 0%, var(--ring-2, var(--ring)) 50%, var(--ring-3, var(--ring)) 100%)",
          }}
        >
          <div
            className="grid w-full max-w-xs place-items-center p-5 text-center font-mono text-xs text-foreground sm:p-6 sm:text-sm"
            style={previewStyle}
          >
            {t("previewCaption")}
          </div>
        </div>

        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <div className="flex items-start gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs leading-5">
              {css}
            </code>
            <CopyButton value={css} label="CSS" className="shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <SliderRow
          label={t("fields.blur")}
          value={state.blur}
          min={PX_RANGES.blur.min}
          max={PX_RANGES.blur.max}
          onChange={(value) => setPx("blur", value)}
          unit="px"
        />
        <SliderRow
          label={t("fields.saturation")}
          value={state.saturation}
          min={0}
          max={300}
          onChange={(value) =>
            setState((prev) => ({ ...prev, saturation: value }))
          }
          unit="%"
        />
        <SliderRow
          label={t("fields.transparency")}
          value={Math.round(state.bgAlpha * 100)}
          min={0}
          max={100}
          onChange={(value) =>
            setState((prev) => ({ ...prev, bgAlpha: value / 100 }))
          }
          unit="%"
        />
        <SliderRow
          label={t("fields.border")}
          value={Math.round(state.borderAlpha * 100)}
          min={0}
          max={100}
          onChange={(value) =>
            setState((prev) => ({ ...prev, borderAlpha: value / 100 }))
          }
          unit="%"
        />
        <SliderRow
          label={t("fields.radius")}
          value={state.radius}
          min={PX_RANGES.radius.min}
          max={PX_RANGES.radius.max}
          onChange={(value) => setPx("radius", value)}
          unit="px"
        />

        <ColorField
          label={t("fields.color")}
          value={state.color}
          onChange={(color) => setState((prev) => ({ ...prev, color }))}
        />
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
  // Local draft so a half-typed value (e.g. "" or "1") doesn't snap to the
  // clamped number mid-edit; commit + clamp on change/blur only.
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
            <span className="font-mono text-xs text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(clampNumber(Number(event.target.value), min, max))
        }
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
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  // The native color picker only understands 6-digit hex; show the current
  // value as a swatch, falling back to white if it isn't parseable hex.
  const hexForPicker = /^#[0-9a-f]{6}$/i.test(value.trim())
    ? value.trim()
    : "#ffffff";

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
    </div>
  );
}
