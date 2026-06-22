"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { parseHex, rgbToHex } from "@/lib/tools/color";
import { mixColors } from "@/lib/tools/color-mix";

// Interpolation spaces worth offering — srgb for the naive mix, the
// perceptual spaces (oklch/oklab/lab) for mixes that don't go muddy
// through the middle. These drive the CSS-native color-mix() preview; the
// copyable result hex is computed in JS (sRGB) since the browser only
// resolves color-mix() at paint time.
const SPACES = ["oklch", "oklab", "srgb", "hsl", "lab"] as const;
type Space = (typeof SPACES)[number];

const STRIP_STEPS = 11;

export function ColorMix() {
  const t = useTranslations("Tools.colorMix");
  const tc = useTranslations("Tools.common");

  const [a, setA] = useState("#0ea5b7");
  const [b, setB] = useState("#d71920");
  const [ratio, setRatio] = useState(50);
  const [space, setSpace] = useState<Space>("oklch");

  const rgbA = useMemo(() => parseHex(a), [a]);
  const rgbB = useMemo(() => parseHex(b), [b]);
  const bothValid = rgbA !== null && rgbB !== null;

  // Concrete sRGB result the user can copy as a value. `ratio` is the
  // weight of A, so the mix weight toward B is (100 - ratio) / 100.
  const resultHex = useMemo<string | null>(() => {
    if (!rgbA || !rgbB) return null;
    return rgbToHex(mixColors(rgbA, rgbB, (100 - ratio) / 100));
  }, [rgbA, rgbB, ratio]);

  // CSS-native preview in the chosen perceptual space — only built when both
  // inputs parse, so we never feed color-mix() a malformed token.
  const css = useMemo(
    () => (bothValid ? `color-mix(in ${space}, ${a} ${ratio}%, ${b})` : null),
    [bothValid, space, a, b, ratio],
  );

  // A strip of mixes so you can see the whole interpolation path, not just
  // the single ratio.
  const strip = useMemo(
    () =>
      bothValid
        ? Array.from(
            { length: STRIP_STEPS },
            (_, i) =>
              `color-mix(in ${space}, ${a} ${Math.round(
                (i / (STRIP_STEPS - 1)) * 100,
              )}%, ${b})`,
          )
        : null,
    [bothValid, space, a, b],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid min-w-0 gap-3">
        {/* Big result swatch — CSS color-mix() in the chosen space. */}
        {css && resultHex ? (
          <div
            role="img"
            aria-label={t("resultAria", { hex: resultHex })}
            className="aspect-16/7 rounded-lg border border-border"
            style={{ background: css }}
          />
        ) : (
          <div className="grid aspect-16/7 place-items-center rounded-lg border border-dashed border-border bg-card/40 px-4 text-center text-sm text-muted-foreground">
            {tc("invalid")}
          </div>
        )}

        {/* Interpolation strip 0 → 100%. */}
        {strip ? (
          <div
            role="img"
            aria-label={t("stripAria")}
            className="flex h-8 overflow-hidden rounded-md border border-border"
          >
            {strip.map((bg, i) => (
              <div key={i} className="flex-1" style={{ background: bg }} />
            ))}
          </div>
        ) : (
          <div className="h-8 rounded-md border border-dashed border-border bg-card/40" />
        )}

        {/* Copyable result — concrete sRGB hex plus the CSS expression. */}
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-md border border-border"
              style={{ background: resultHex ?? "transparent" }}
            />
            <code className="min-w-0 flex-1 rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-sm tabular-nums">
              {resultHex ?? tc("invalid")}
            </code>
            <CopyButton
              value={resultHex ?? ""}
              label={t("result")}
              disabled={!resultHex}
              className="shrink-0"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
              {css ?? tc("invalid")}
            </code>
            <CopyButton
              value={css ?? ""}
              label={t("css")}
              disabled={!css}
              className="shrink-0"
            />
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <Swatch
          label={t("colorA")}
          value={a}
          onChange={setA}
          pickerLabel={t("colorAPicker")}
          hexLabel={t("colorAHex")}
          invalidText={tc("invalid")}
        />

        <div className="grid gap-1.5">
          <label
            htmlFor="color-mix-ratio"
            className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <span>{t("ratioOfA")}</span>
            <span className="tabular-nums">{ratio}%</span>
          </label>
          <input
            id="color-mix-ratio"
            type="range"
            min={0}
            max={100}
            value={ratio}
            onChange={(e) => setRatio(clampInt(e.target.value, 0, 100, ratio))}
            aria-label={t("ratioAria")}
            aria-valuetext={`${ratio}%`}
            className={cn(
              "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
              FOCUS_RING,
            )}
          />
        </div>

        <Swatch
          label={t("colorB")}
          value={b}
          onChange={setB}
          pickerLabel={t("colorBPicker")}
          hexLabel={t("colorBHex")}
          invalidText={tc("invalid")}
        />

        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("space")}
          </span>
          <div className="flex flex-wrap gap-1">
            {SPACES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={space === s}
                onClick={() => setSpace(s)}
                className={cn(
                  "min-h-9 rounded-md border px-2 py-1 font-mono text-[0.7rem] transition-colors duration-(--motion-fast)",
                  FOCUS_RING_INSET,
                  space === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground motion-safe:hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Swatch({
  label,
  value,
  onChange,
  pickerLabel,
  hexLabel,
  invalidText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  pickerLabel: string;
  hexLabel: string;
  invalidText: string;
}) {
  const parsed = parseHex(value);
  const valid = parsed !== null;
  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          type="color"
          // Native picker can't represent an invalid string; mirror the last
          // valid parse so the swatch stays sensible while text is mid-edit.
          value={valid ? rgbToHex(parsed) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5",
            FOCUS_RING_INSET,
          )}
          aria-label={pickerLabel}
        />
        <Input
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!valid}
          aria-label={hexLabel}
          className={cn("min-w-0 flex-1 font-mono", !valid && "border-signal")}
        />
      </div>
      {!valid ? (
        <p className="font-mono text-[0.6rem] text-signal" role="alert">
          {invalidText}
        </p>
      ) : null}
    </div>
  );
}
