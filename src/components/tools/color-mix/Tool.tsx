"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Interpolation spaces worth offering — srgb for the naive mix, the
// perceptual spaces (oklch/oklab/lab) for mixes that don't go muddy
// through the middle.
const SPACES = ["oklch", "oklab", "srgb", "hsl", "lab"] as const;
type Space = (typeof SPACES)[number];

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function ColorMix() {
  const [a, setA] = useState("#0ea5b7");
  const [b, setB] = useState("#d71920");
  const [ratio, setRatio] = useState(50);
  const [space, setSpace] = useState<Space>("oklch");

  const css = useMemo(
    () => `color-mix(in ${space}, ${a} ${ratio}%, ${b})`,
    [space, a, b, ratio],
  );
  // A strip of mixes so you can see the whole interpolation path, not
  // just the single ratio.
  const strip = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => `color-mix(in ${space}, ${a} ${i * 10}%, ${b})`),
    [space, a, b],
  );

  function copy() {
    void navigator.clipboard.writeText(css).then(() => toast.success("Copied color-mix()"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid min-w-0 gap-3">
        {/* Big result swatch. */}
        <div
          className="aspect-16/7 rounded-lg border border-border"
          style={{ background: css }}
        />
        {/* Interpolation strip 0 → 100%. */}
        <div className="flex h-8 overflow-hidden rounded-md border border-border">
          {strip.map((bg, i) => (
            <div key={i} className="flex-1" style={{ background: bg }} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
            {css}
          </code>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={copy}
            aria-label="Copy color-mix()"
          >
            <Copy className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid content-start gap-4">
        <Swatch label="Color A" value={a} onChange={setA} />
        <div className="grid gap-1.5">
          <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Ratio of A</span>
            <span className="tabular-nums">{ratio}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={ratio}
            onChange={(e) => setRatio(Number(e.target.value))}
            aria-label="Ratio of color A"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
          />
        </div>
        <Swatch label="Color B" value={b} onChange={setB} />

        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Interpolation space
          </span>
          <div className="flex flex-wrap gap-1">
            {SPACES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={space === s}
                onClick={() => setSpace(s)}
                className={`rounded-md border px-2 py-1 font-mono text-[0.7rem] transition-colors duration-(--motion-fast) ${
                  space === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = HEX.test(value);
  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!valid}
          aria-label={`${label} hex value`}
          className={`w-full rounded-md border bg-background px-3 py-2 font-mono text-sm ${
            valid ? "border-border" : "border-signal"
          }`}
        />
      </div>
    </div>
  );
}
