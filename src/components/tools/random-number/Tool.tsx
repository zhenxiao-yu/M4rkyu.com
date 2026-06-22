"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cryptoRandomInt,
  randomNumbers,
  RANDOM_NUMBER_MAX_COUNT,
  RANDOM_NUMBER_MIN_COUNT,
  type RandomNumberResult,
} from "@/lib/tools/random-number";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

// Bounds are intentionally wide but finite so the number inputs can't overflow
// into Infinity / lose integer precision. Count is capped by the generator
// (RANDOM_NUMBER_MAX_COUNT) to keep a stray request from freezing the tab.
const BOUND = 1_000_000;
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 100;
const DEFAULT_COUNT = 5;

// Browser-backed unbiased RNG, created once. The tool is mounted client-only
// (dynamic ssr:false in tool-renderer), so crypto.getRandomValues is always
// available — no hydration concern for the lazy initial draw below.
const randomInt = cryptoRandomInt((array) => crypto.getRandomValues(array));

export function RandomNumber() {
  const t = useTranslations("Tools.randomNumber");
  const tc = useTranslations("Tools.common");

  // Raw input strings so each field stays editable (allows transient empty /
  // partial / "-" values); clamped numbers are derived on demand.
  const [minDraft, setMinDraft] = useState(String(DEFAULT_MIN));
  const [maxDraft, setMaxDraft] = useState(String(DEFAULT_MAX));
  const [countDraft, setCountDraft] = useState(String(DEFAULT_COUNT));
  const [unique, setUnique] = useState(false);

  const min = clampInt(minDraft, -BOUND, BOUND, DEFAULT_MIN);
  const max = clampInt(maxDraft, -BOUND, BOUND, DEFAULT_MAX);
  const count = clampInt(
    countDraft,
    RANDOM_NUMBER_MIN_COUNT,
    RANDOM_NUMBER_MAX_COUNT,
    DEFAULT_COUNT,
  );

  // null = the "press generate" empty state; a result = generated (success or a
  // count-exceeds-range failure). These are deliberately distinct surfaces.
  const [result, setResult] = useState<RandomNumberResult | null>(null);

  const swapped = min > max;

  function generate() {
    setResult(randomNumbers({ min, max, count, unique }, randomInt));
  }

  const values = result?.ok ? result.values : [];
  const all = values.join(", ");

  return (
    <div className="grid gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-2 min-w-0">
        <NumberField
          id="rn-min"
          label={t("min")}
          ariaLabel={t("minAria")}
          value={minDraft}
          fallback={DEFAULT_MIN}
          onChange={setMinDraft}
        />
        <NumberField
          id="rn-max"
          label={t("max")}
          ariaLabel={t("maxAria")}
          value={maxDraft}
          fallback={DEFAULT_MAX}
          onChange={setMaxDraft}
        />
        <NumberField
          id="rn-count"
          label={t("count")}
          ariaLabel={t("countAria", {
            min: RANDOM_NUMBER_MIN_COUNT,
            max: RANDOM_NUMBER_MAX_COUNT,
          })}
          value={countDraft}
          min={RANDOM_NUMBER_MIN_COUNT}
          max={RANDOM_NUMBER_MAX_COUNT}
          fallback={DEFAULT_COUNT}
          onChange={setCountDraft}
        />
        <label
          htmlFor="rn-unique"
          className={cn(
            "flex min-h-9 cursor-pointer items-center gap-2 self-end rounded-md border border-border bg-background/40 px-3 py-2 text-sm",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            "hover:bg-background/70 has-focus-visible:ring-2 has-focus-visible:ring-ring",
          )}
        >
          <input
            id="rn-unique"
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="size-4 shrink-0 rounded border-border accent-ring focus-visible:outline-none"
          />
          <span className="font-mono text-xs">{t("unique")}</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <Button type="button" size="sm" onClick={generate} className="min-h-9">
          <RefreshCw className="size-3.5" aria-hidden="true" />
          {tc("generate")}
        </Button>
        <CopyButton
          value={all}
          label={t("copyResultsLabel")}
          size="sm"
          disabled={values.length === 0}
          className="ml-auto min-h-9"
        >
          {tc("copyAll")}
        </CopyButton>
      </div>

      {swapped ? (
        <p role="status" className="font-mono text-xs text-muted-foreground">
          {t("swapHint", { min, max })}
        </p>
      ) : null}

      {/* Results / error / empty — three distinct surfaces */}
      {result && !result.ok ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          {t("countExceedsRange", {
            count: result.count,
            range: result.rangeSize,
          })}
        </p>
      ) : result === null ? (
        <div className="grid place-items-center gap-1 rounded-md border border-dashed border-border bg-card/40 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{tc("empty")}</p>
          <p className="text-xs text-muted-foreground/70">{tc("emptyHint")}</p>
        </div>
      ) : (
        <ul
          aria-label={t("resultsAria")}
          className="flex flex-wrap gap-2 rounded-md border border-border bg-card/40 p-3"
        >
          {values.map((v, i) => (
            <li
              key={`${i}-${v}`}
              className="rounded-md border border-border bg-background/60 px-3 py-1 font-mono text-sm tabular-nums"
            >
              {v}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[0.65rem] text-muted-foreground/70">{t("note")}</p>
    </div>
  );
}

function NumberField({
  id,
  label,
  ariaLabel,
  value,
  min,
  max,
  fallback,
  onChange,
}: {
  id: string;
  label: string;
  ariaLabel: string;
  value: string;
  min?: number;
  max?: number;
  fallback: number;
  onChange: (v: string) => void;
}) {
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          const lo = min ?? -BOUND;
          const hi = max ?? BOUND;
          onChange(String(clampInt(e.target.value, lo, hi, fallback)));
        }}
        className={cn("w-24 min-w-0 font-mono", FOCUS_RING_INSET)}
      />
    </label>
  );
}
