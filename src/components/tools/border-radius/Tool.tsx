"use client";

import { useId, useState } from "react";
import { Link2, Link2Off } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import {
  buildBorderRadiusCss,
  type CornerRadii,
  type RadiusUnit,
} from "@/lib/tools/border-radius";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";

// CSS border-radius generator. Native range + number inputs (no shadcn slider
// needed); the shorthand is assembled by the pure, unit-tested
// buildBorderRadius in @/lib/tools/border-radius so the preview and copy value
// never drift. Numeric fields are NaN-safe (clampInt) and clamp to the active
// unit's range, so the output is always a valid border-radius.

const INITIAL: CornerRadii = { tl: 24, tr: 24, br: 24, bl: 24 };
const UNITS: readonly RadiusUnit[] = ["px", "%"] as const;
const MAX_BY_UNIT: Record<RadiusUnit, number> = { px: 200, "%": 50 };

const CORNERS = ["tl", "tr", "br", "bl"] as const;
type CornerKey = (typeof CORNERS)[number];

export function BorderRadius() {
  const t = useTranslations("Tools.borderRadius");
  const tc = useTranslations("Tools.common");

  const [radii, setRadii] = useState<CornerRadii>(INITIAL);
  const [unit, setUnit] = useState<RadiusUnit>("px");
  const [linked, setLinked] = useState(true);

  const max = MAX_BY_UNIT[unit];
  const css = buildBorderRadiusCss(radii, unit);
  const preview = `${radii.tl}${unit} ${radii.tr}${unit} ${radii.br}${unit} ${radii.bl}${unit}`;

  function setCorner(key: CornerKey, value: number) {
    setRadii((prev) =>
      linked ? { tl: value, tr: value, br: value, bl: value } : { ...prev, [key]: value },
    );
  }

  function changeUnit(next: RadiusUnit) {
    if (next === unit) return;
    const nextMax = MAX_BY_UNIT[next];
    setUnit(next);
    // Re-clamp so a px value above the % ceiling can't escape the slider.
    setRadii((prev) => ({
      tl: Math.min(prev.tl, nextMax),
      tr: Math.min(prev.tr, nextMax),
      br: Math.min(prev.br, nextMax),
      bl: Math.min(prev.bl, nextMax),
    }));
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="grid min-w-0 gap-5 rounded-md border border-border/60 bg-background/40 p-5 sm:p-8">
        <div className="grid place-items-center">
          <div
            role="img"
            aria-label={t("previewLabel", { value: preview })}
            className="aspect-square w-full max-w-52 border-2 border-ring bg-ring/15 motion-safe:transition-[border-radius] motion-safe:duration-200"
            style={{ borderRadius: preview }}
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={linked ? "default" : "outline"}
            aria-pressed={linked}
            onClick={() => setLinked((v) => !v)}
            className="min-h-9"
          >
            {linked ? (
              <Link2 className="size-3.5" aria-hidden="true" />
            ) : (
              <Link2Off className="size-3.5" aria-hidden="true" />
            )}
            {linked ? t("linked") : t("perCorner")}
          </Button>

          <div
            role="radiogroup"
            aria-label={t("unit")}
            className="inline-flex rounded-md border border-border bg-card/40 p-0.5"
          >
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={unit === u}
                onClick={() => changeUnit(u)}
                className={cn(
                  "min-h-9 rounded-sm px-3 font-mono text-xs tabular-nums",
                  FOCUS_RING_INSET,
                  unit === u
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground motion-safe:transition-colors hover:text-foreground",
                )}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {linked ? (
          <CornerRow
            label={t("corners.all")}
            value={radii.tl}
            max={max}
            unit={unit}
            onChange={(value) => setCorner("tl", value)}
          />
        ) : (
          CORNERS.map((key) => (
            <CornerRow
              key={key}
              label={t(`corners.${key}`)}
              value={radii[key]}
              max={max}
              unit={unit}
              onChange={(value) => setCorner(key, value)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CornerRow({
  label,
  value,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  unit: RadiusUnit;
  onChange: (value: number) => void;
}) {
  const id = useId();
  // Local draft so a half-typed value (e.g. "" mid-edit) doesn't snap to the
  // clamped number; commit + clamp on change/blur only.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(raw: string) {
    onChange(clampInt(raw, 0, max, value));
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
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(event) => onChange(clampInt(event.target.value, 0, max, value))}
        aria-label={label}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
          FOCUS_RING,
        )}
      />
    </div>
  );
}
