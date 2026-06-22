"use client";

import { useId, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import {
  BLOB_LIMITS,
  BLOB_SIZE,
  buildBlobClipPath,
  buildBlobSvg,
  generateBlob,
} from "@/lib/tools/blob";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Draw a fresh 32-bit seed. Uses crypto.getRandomValues where available so
 * "regenerate" doesn't lean on Math.random; falls back gracefully (SSR / old
 * webviews). Each click changes the seed, which re-derives a new blob — the
 * path itself is computed in a useMemo, never per render.
 */
function nextSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  }
  return Math.floor(Math.random() * 0xffffffff);
}

export function BlobGenerator() {
  const t = useTranslations("Tools.blob");
  const tc = useTranslations("Tools.common");
  const baseId = useId();

  const [complexity, setComplexity] = useState(6);
  const [contrast, setContrast] = useState(50);
  const [color, setColor] = useState("#0ea5b7");
  const [seed, setSeed] = useState(1337);

  // The blob path is the single derived value; everything else strings off it.
  const { path } = useMemo(
    () => generateBlob({ complexity, contrast, seed }),
    [complexity, contrast, seed],
  );

  const svg = buildBlobSvg(path, color);
  const clipPath = buildBlobClipPath(path);

  const complexityId = `${baseId}-complexity`;
  const contrastId = `${baseId}-contrast`;
  const colorId = `${baseId}-color`;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      {/* Preview + output */}
      <div className="grid min-w-0 gap-3">
        <div className="flex justify-center rounded-lg border border-border bg-card/40 p-6">
          <svg
            viewBox={`0 0 ${BLOB_SIZE} ${BLOB_SIZE}`}
            className="block aspect-square w-full max-w-sm drop-shadow-sm"
            role="img"
            aria-label={t("previewAlt")}
          >
            <path fill={color} d={path} />
          </svg>
        </div>

        <div className="grid gap-3" role="group" aria-label={tc("output")}>
          <OutputField label={t("svgLabel")} value={svg} block />
          <OutputField label={t("pathLabel")} value={path} />
          <OutputField label={t("clipPathLabel")} value={clipPath} />
        </div>
      </div>

      {/* Controls */}
      <div className="grid content-start gap-4">
        <Slider
          id={complexityId}
          label={t("complexity")}
          value={complexity}
          min={BLOB_LIMITS.complexity.min}
          max={BLOB_LIMITS.complexity.max}
          suffix={` ${t("ptsSuffix")}`}
          onChange={setComplexity}
        />
        <Slider
          id={contrastId}
          label={t("contrast")}
          value={contrast}
          min={BLOB_LIMITS.contrast.min}
          max={BLOB_LIMITS.contrast.max}
          suffix="%"
          onChange={setContrast}
        />

        <div className="grid gap-1.5">
          <label
            htmlFor={colorId}
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("color")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id={colorId}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label={t("color")}
              className={cn(
                "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5",
                FOCUS_RING,
              )}
            />
            <Input
              type="text"
              inputMode="text"
              spellCheck={false}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label={t("colorHex")}
              className="h-9 min-w-0 flex-1 font-mono text-xs"
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setSeed(nextSeed())}
          className="min-h-9"
        >
          <RefreshCw
            className="size-3.5 motion-safe:transition-transform"
            aria-hidden="true"
          />{" "}
          {t("regenerate")}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[0.6rem] text-muted-foreground">
            {t("seed")} · <span className="tabular-nums">{seed}</span>
          </p>
          <CopyButton
            value={String(seed)}
            label={t("seed")}
            className="ml-auto"
          />
        </div>
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clampInt(e.target.value, min, max, min))}
        aria-label={label}
        className={cn(
          "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
          FOCUS_RING,
        )}
      />
    </div>
  );
}

function OutputField({
  label,
  value,
  block,
}: {
  label: string;
  value: string;
  block?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <CopyButton value={value} label={label} />
      </div>
      {block ? (
        <pre className="overflow-x-auto rounded-md border border-border bg-card/40 p-3 font-mono text-[0.7rem] leading-relaxed">
          {value}
        </pre>
      ) : (
        <code className="block overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs break-all">
          {value}
        </code>
      )}
    </div>
  );
}
