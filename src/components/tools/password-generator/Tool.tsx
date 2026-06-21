"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

function generate(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}) {
  let pool =
    (opts.lower ? SETS.lower : "") +
    (opts.upper ? SETS.upper : "") +
    (opts.digits ? SETS.digits : "") +
    (opts.symbols ? SETS.symbols : "");
  if (opts.noAmbiguous) pool = pool.replace(/[0OIl1]/g, "");
  if (!pool) return "";
  const bytes = new Uint32Array(opts.length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < opts.length; i++) out += pool[bytes[i] % pool.length];
  return out;
}

function strength(pw: string): { label: string; pct: number } {
  if (!pw) return { label: "—", pct: 0 };
  let bits = 0;
  const pool =
    (/[a-z]/.test(pw) ? 26 : 0) +
    (/[A-Z]/.test(pw) ? 26 : 0) +
    (/[0-9]/.test(pw) ? 10 : 0) +
    (/[^a-zA-Z0-9]/.test(pw) ? 32 : 0);
  bits = Math.round(pw.length * Math.log2(Math.max(pool, 2)));
  const labels: [number, string][] = [
    [80, "very strong"],
    [60, "strong"],
    [40, "ok"],
    [20, "weak"],
    [0, "very weak"],
  ];
  const label = labels.find(([t]) => bits >= t)?.[1] ?? "very weak";
  return { label, pct: Math.min(100, (bits / 100) * 100) };
}

export function PasswordGenerator() {
  const [length, setLength] = useState(20);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [value, setValue] = useState(() =>
    generate({ length: 20, lower: true, upper: true, digits: true, symbols: true, noAmbiguous: false }),
  );

  function regenerate() {
    setValue(generate({ length, lower, upper, digits, symbols, noAmbiguous }));
  }
  function copy() {
    void navigator.clipboard.writeText(value).then(() => toast.success("Copied"));
  }
  const s = strength(value);

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card/40 p-2 font-mono">
        <code className="flex-1 truncate text-sm">{value || "—"}</code>
        <Button type="button" size="sm" variant="outline" onClick={regenerate}>
          <RefreshCw className="size-3.5" aria-hidden="true" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!value}>
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">Strength · {s.label}</span>
          <span className="font-mono text-muted-foreground">{value.length} chars</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-ring transition-[width]" style={{ width: `${s.pct}%` }} />
        </div>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Length</span>
            <span className="tabular-nums">{length}</span>
          </label>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            aria-label="Password length"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-sm">
          <Toggle label="a-z" value={lower} set={setLower} />
          <Toggle label="A-Z" value={upper} set={setUpper} />
          <Toggle label="0-9" value={digits} set={setDigits} />
          <Toggle label="!@#$" value={symbols} set={setSymbols} />
          <Toggle label="No 0/O/I/l" value={noAmbiguous} set={setNoAmbiguous} />
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  set,
}: {
  label: string;
  value: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => set(e.target.checked)}
        className="size-4 rounded border-border accent-ring"
      />
      <span className="font-mono text-xs">{label}</span>
    </label>
  );
}
