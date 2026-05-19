"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function rng(min: number, max: number): number {
  // crypto.getRandomValues for uniform unbiased sampling in [min, max].
  const range = max - min + 1;
  const buf = new Uint32Array(1);
  // Rejection sample to remove modulo bias.
  const limit = Math.floor(0x100000000 / range) * range;
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return min + (value % range);
}

export function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [values, setValues] = useState<number[]>(() => [rng(1, 100)]);
  const [error, setError] = useState<string | null>(null);

  function regenerate() {
    setError(null);
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const range = hi - lo + 1;
    if (unique && count > range) {
      setError("Cannot draw more unique values than the range contains.");
      return;
    }
    const out: number[] = [];
    if (unique) {
      const seen = new Set<number>();
      while (seen.size < count) {
        const v = rng(lo, hi);
        if (!seen.has(v)) {
          seen.add(v);
          out.push(v);
        }
      }
    } else {
      for (let i = 0; i < count; i++) out.push(rng(lo, hi));
    }
    setValues(out);
  }

  function copy() {
    void navigator.clipboard.writeText(values.join(", ")).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Number label="Min" value={min} onChange={setMin} />
        <Number label="Max" value={max} onChange={setMax} />
        <Number label="Count" value={count} min={1} max={500} onChange={setCount} />
        <label className="flex items-center gap-2 self-end rounded-md border border-border bg-background/40 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="size-4 rounded border-border accent-ring"
          />
          <span>Unique</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={regenerate}>
          <RefreshCw className="size-3.5" aria-hidden="true" /> Generate
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copy} disabled={values.length === 0}>
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <ul className="flex flex-wrap gap-2 rounded-md border border-border bg-card/40 p-3">
        {values.map((v, i) => (
          <li key={i} className="rounded-md border border-border bg-background/60 px-3 py-1 font-mono text-sm tabular-nums">
            {v}
          </li>
        ))}
      </ul>
      <p className="text-[0.65rem] text-muted-foreground/70">
        Drawn from <code>crypto.getRandomValues</code> with rejection sampling — modulo-bias free.
      </p>
    </div>
  );
}

function Number({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.trunc(globalThis.Number(e.target.value) || 0))}
        className="font-mono"
      />
    </label>
  );
}
