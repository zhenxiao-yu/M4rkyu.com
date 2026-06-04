"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ROOT_PX = 16;

// Trim trailing zeros from a fixed-precision number so the output reads
// like hand-written CSS (1.5rem, not 1.5000rem).
function trim(n: number, dp = 4): string {
  return Number(n.toFixed(dp)).toString();
}

interface Field {
  key: "minFont" | "maxFont" | "minVw" | "maxVw";
  label: string;
}

const FIELDS: Field[] = [
  { key: "minFont", label: "Min font (px)" },
  { key: "maxFont", label: "Max font (px)" },
  { key: "minVw", label: "Min viewport (px)" },
  { key: "maxVw", label: "Max viewport (px)" },
];

export function FluidType() {
  const [v, setV] = useState({ minFont: 16, maxFont: 40, minVw: 360, maxVw: 1280 });
  const [previewVw, setPreviewVw] = useState(768);

  const out = useMemo(() => {
    const { minFont, maxFont, minVw, maxVw } = v;
    const span = maxVw - minVw;
    // Guard the degenerate viewport range (would divide by zero / blow up
    // the slope). Fall back to a flat size so the UI never NaNs.
    const slope = span > 0 ? (maxFont - minFont) / span : 0;
    const interceptPx = minFont - slope * minVw;
    const vw = slope * 100;
    const minRem = minFont / ROOT_PX;
    const maxRem = maxFont / ROOT_PX;
    const lo = Math.min(minRem, maxRem);
    const hi = Math.max(minRem, maxRem);
    const css = `clamp(${trim(lo)}rem, ${trim(vw, 4)}vw + ${trim(interceptPx / ROOT_PX)}rem, ${trim(hi)}rem)`;
    return { css, slope, interceptPx, ok: span > 0 };
  }, [v]);

  // Resolve the size at the simulated viewport so the preview is
  // controllable (a literal `clamp()` would track the real window).
  const resolvedPx = useMemo(() => {
    const raw = out.slope * previewVw + out.interceptPx;
    return Math.round(Math.min(Math.max(raw, Math.min(v.minFont, v.maxFont)), Math.max(v.minFont, v.maxFont)));
  }, [out, previewVw, v.minFont, v.maxFont]);

  function set(key: Field["key"], value: number) {
    setV((p) => ({ ...p, [key]: Number.isFinite(value) ? value : 0 }));
  }
  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid min-w-0 gap-3">
        {/* Live preview at the simulated viewport. */}
        <div className="grid gap-2 rounded-lg border border-border bg-card/40 p-4">
          <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Preview</span>
            <span className="tabular-nums">
              {previewVw}px → {resolvedPx}px
            </span>
          </div>
          <p
            className="wrap-break-word font-display font-semibold leading-tight text-foreground"
            style={{ fontSize: `${resolvedPx}px` }}
          >
            Ag fluid type
          </p>
          <input
            type="range"
            min={Math.min(v.minVw, v.maxVw)}
            max={Math.max(v.minVw, v.maxVw)}
            value={Math.min(Math.max(previewVw, Math.min(v.minVw, v.maxVw)), Math.max(v.minVw, v.maxVw))}
            onChange={(e) => setPreviewVw(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
            aria-label="Simulated viewport width"
          />
        </div>

        <CopyField
          label="CSS"
          value={`font-size: ${out.css};`}
          onCopy={() => copy(`font-size: ${out.css};`, "CSS")}
        />
        <CopyField label="Value" value={out.css} onCopy={() => copy(out.css, "value")} />
        {!out.ok ? (
          <p className="font-mono text-[0.65rem] text-warning">
            Max viewport must be greater than min viewport.
          </p>
        ) : null}
      </div>

      <div className="grid content-start gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="grid gap-1.5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {f.label}
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={v[f.key]}
              onChange={(e) => set(f.key, Number(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
            />
          </label>
        ))}
        <p className="font-mono text-[0.6rem] leading-relaxed text-muted-foreground">
          Assumes a 16px root. Scales linearly between the two viewports,
          locked outside them.
        </p>
      </div>
    </div>
  );
}

function CopyField({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
          {value}
        </code>
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
    </div>
  );
}
