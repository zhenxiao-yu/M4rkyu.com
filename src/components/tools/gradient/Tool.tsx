"use client";

import { useMemo, useState } from "react";
import { Copy, Plus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Stop {
  color: string;
  pos: number;
}

function build(stops: Stop[], type: "linear" | "radial", angle: number) {
  const sorted = [...stops].sort((a, b) => a.pos - b.pos);
  const stopStr = sorted.map((s) => `${s.color} ${s.pos}%`).join(", ");
  return type === "linear"
    ? `linear-gradient(${angle}deg, ${stopStr})`
    : `radial-gradient(circle, ${stopStr})`;
}

export function GradientGenerator() {
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState(135);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#7c3aed", pos: 0 },
    { color: "#22d3ee", pos: 100 },
  ]);

  const css = useMemo(() => build(stops, type, angle), [stops, type, angle]);
  const tw = `bg-[${css.replace(/\s/g, "_")}]`;

  function update(i: number, patch: Partial<Stop>) {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function add() {
    if (stops.length >= 6) return;
    setStops((prev) => [...prev, { color: "#ffffff", pos: 50 }]);
  }
  function remove(i: number) {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, idx) => idx !== i));
  }
  function randomize() {
    const n = 2 + Math.floor(Math.random() * 3);
    const next = Array.from({ length: n }, (_, i) => ({
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
      pos: Math.round((i / (n - 1)) * 100),
    }));
    setStops(next);
  }
  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <div className="grid gap-3">
        <div className="aspect-[16/9] rounded-lg border border-border" style={{ background: css }} />
        <CopyField label="CSS" value={`background: ${css};`} onCopy={() => copy(`background: ${css};`, "CSS")} />
        <CopyField label="Tailwind" value={tw} onCopy={() => copy(tw, "class")} />
      </div>
      <div className="grid gap-3">
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["linear", "radial"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={type === t}
              onClick={() => setType(t)}
              className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] ${type === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        {type === "linear" ? (
          <div className="grid gap-1.5">
            <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>Angle</span>
              <span className="tabular-nums">{angle}°</span>
            </label>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
            />
          </div>
        ) : null}
        <div className="grid gap-2">
          {stops.map((stop, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => update(i, { color: e.target.value })}
                className="size-8 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
                aria-label={`Stop ${i + 1} color`}
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={stop.pos}
                onChange={(e) => update(i, { pos: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                className="w-16 font-mono text-xs"
                aria-label={`Stop ${i + 1} position`}
              />
              <span className="text-xs text-muted-foreground">%</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => remove(i)}
                disabled={stops.length <= 2}
                aria-label={`Remove stop ${i + 1}`}
              >
                <X className="size-3" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={add} disabled={stops.length >= 6}>
            <Plus className="size-3.5" aria-hidden="true" /> Stop
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={randomize}>
            <RefreshCw className="size-3.5" aria-hidden="true" /> Random
          </Button>
        </div>
      </div>
    </div>
  );
}

function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="grid gap-1.5">
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
          {value}
        </code>
        <Button type="button" size="sm" variant="outline" onClick={onCopy} aria-label={`Copy ${label}`}>
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
