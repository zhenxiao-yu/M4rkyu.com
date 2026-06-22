"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import {
  formatHsl,
  formatRgb,
  hslToRgb,
  parseHex,
  parseHslString,
  parseRgbString,
  rgbToHex,
  rgbToHsl,
  type RGB,
} from "@/lib/tools/color";

// Three-way Hex ↔ RGB ↔ HSL converter. Editing any field updates the
// other two and the live preview swatch. Color math lives in
// @/lib/tools/color (pure + unit-tested).

const INITIAL_RGB: RGB = { r: 124, g: 58, b: 237 };

export function ColorConverter() {
  const t = useTranslations("Tools.colorConverter");
  const [rgb, setRgbState] = useState<RGB>(INITIAL_RGB);
  const [hexInput, setHexInput] = useState(rgbToHex(INITIAL_RGB));
  const [rgbInput, setRgbInput] = useState(formatRgb(INITIAL_RGB));
  const [hslInput, setHslInput] = useState(formatHsl(rgbToHsl(INITIAL_RGB)));

  // Single source of truth for "rgb changed via picker / shade button /
  // another field's commit" — refreshes every input string. No effect:
  // each entry point explicitly fans out, which is what React 19's
  // set-state-in-effect lint rule asks for.
  function commitRgb(next: RGB) {
    setRgbState(next);
    setHexInput(rgbToHex(next));
    setRgbInput(formatRgb(next));
    setHslInput(formatHsl(rgbToHsl(next)));
  }

  function handleHexChange(value: string) {
    setHexInput(value);
    const parsed = parseHex(value);
    if (parsed) commitRgb(parsed);
  }

  function handleRgbChange(value: string) {
    setRgbInput(value);
    const parsed = parseRgbString(value);
    if (parsed) commitRgb(parsed);
  }

  function handleHslChange(value: string) {
    setHslInput(value);
    const parsed = parseHslString(value);
    if (parsed) commitRgb(hslToRgb(parsed));
  }

  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  return (
    <div className="grid gap-6">
      <div className="grid items-start gap-4 md:grid-cols-[10rem_1fr] md:items-center">
        <div
          aria-label={t("preview")}
          className="aspect-square w-full rounded-md border border-border/60"
          style={{ backgroundColor: hex }}
        />
        <div className="grid gap-2">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("picker")}
            </span>
            <input
              type="color"
              value={hex}
              onChange={(event) => {
                const parsed = parseHex(event.target.value);
                if (parsed) commitRgb(parsed);
              }}
              aria-label={t("picker")}
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <ConvertField
          label="Hex"
          value={hexInput}
          valid={parseHex(hexInput) !== null}
          onChange={handleHexChange}
          copyValue={hex}
        />
        <ConvertField
          label="RGB"
          value={rgbInput}
          valid={parseRgbString(rgbInput) !== null}
          onChange={handleRgbChange}
          copyValue={formatRgb(rgb)}
        />
        <ConvertField
          label="HSL"
          value={hslInput}
          valid={parseHslString(hslInput) !== null}
          onChange={handleHslChange}
          copyValue={formatHsl(hsl)}
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[15, 35, 50, 65, 85].map((targetL) => {
          const shade = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: targetL }));
          return (
            <button
              key={targetL}
              type="button"
              onClick={() => {
                const parsed = parseHex(shade);
                if (parsed) commitRgb(parsed);
              }}
              aria-label={t("shade", { lightness: targetL, hex: shade })}
              className={cn(
                "grid aspect-square place-items-end rounded-md border border-border/60 p-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:hover:-translate-y-0.5",
                FOCUS_RING_INSET,
              )}
              style={{
                backgroundColor: shade,
                color: targetL > 55 ? "#0a0a0a" : "#fafafa",
              }}
            >
              {targetL}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConvertField({
  label,
  value,
  valid,
  onChange,
  copyValue,
}: {
  label: string;
  value: string;
  valid: boolean;
  onChange: (value: string) => void;
  copyValue: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label={`${label} value`}
          aria-invalid={!valid}
          className={cn("min-w-0 font-mono", !valid && "border-destructive/50")}
        />
        <CopyButton value={copyValue} label={label} className="shrink-0" />
      </div>
    </div>
  );
}
