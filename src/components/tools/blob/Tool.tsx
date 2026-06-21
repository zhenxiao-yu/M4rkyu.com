"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SIZE = 200;

// Tiny seeded PRNG so a given seed always renders the same blob — the
// shape is reproducible and the seed is shown for sharing.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function buildPath(points: number, randomness: number, seed: number): string {
  const rng = mulberry32(seed);
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const base = SIZE * 0.38;
  // Sample a radius per vertex, varied by `randomness`.
  const pts = Array.from({ length: points }, (_, i) => {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const rad = base * (1 - randomness / 2 + rng() * randomness);
    return [cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad] as const;
  });
  // Closed Catmull-Rom → cubic-bezier for a smooth organic outline.
  const n = pts.length;
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r2(c1x)},${r2(c1y)} ${r2(c2x)},${r2(c2y)} ${r2(p2[0])},${r2(p2[1])}`;
  }
  return d + "Z";
}

export function BlobGenerator() {
  const [points, setPoints] = useState(6);
  const [randomness, setRandomness] = useState(0.5);
  const [color, setColor] = useState("#0ea5b7");
  const [seed, setSeed] = useState(1337);

  const d = useMemo(
    () => buildPath(points, randomness, seed),
    [points, randomness, seed],
  );

  const svg = `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">\n  <path fill="${color}" d="${d}" />\n</svg>`;

  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid min-w-0 gap-3">
        <div className="flex justify-center rounded-lg border border-border bg-card/40 p-6">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            className="block h-auto w-72 max-w-full drop-shadow-sm"
            role="img"
            aria-label="Generated blob"
          >
            <path fill={color} d={d} />
          </svg>
        </div>
        <CopyField label="SVG" value={svg} onCopy={() => copy(svg, "SVG")} block />
        <CopyField label={`path d`} value={d} onCopy={() => copy(d, "path")} />
      </div>

      <div className="grid content-start gap-4">
        <Slider
          label="Complexity"
          value={points}
          min={3}
          max={12}
          suffix=" pts"
          onChange={setPoints}
        />
        <Slider
          label="Randomness"
          value={Math.round(randomness * 100)}
          min={0}
          max={90}
          suffix="%"
          onChange={(n) => setRandomness(n / 100)}
        />
        <div className="grid gap-1.5">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Fill
          </span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              aria-label="Fill color"
            />
            <input
              type="text"
              spellCheck={false}
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Fill color hex value"
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" /> Regenerate
        </Button>
        <p className="font-mono text-[0.6rem] text-muted-foreground">seed · {seed}</p>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">
          {value}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
      />
    </div>
  );
}

function CopyField({
  label,
  value,
  onCopy,
  block,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  block?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      {block ? (
        <pre className="overflow-x-auto rounded-md border border-border bg-card/40 p-3 font-mono text-[0.7rem] leading-relaxed">
          {value}
        </pre>
      ) : (
        <code className="block overflow-x-auto whitespace-nowrap rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
          {value}
        </code>
      )}
    </div>
  );
}
