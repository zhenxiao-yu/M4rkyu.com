"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BoxModel() {
  const [margin, setMargin] = useState(16);
  const [border, setBorder] = useState(4);
  const [padding, setPadding] = useState(16);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(100);

  const css = useMemo(
    () =>
      [`width: ${width}px;`, `height: ${height}px;`, `padding: ${padding}px;`, `border: ${border}px solid;`, `margin: ${margin}px;`].join("\n"),
    [margin, border, padding, width, height],
  );

  const outerW = width + (padding + border + margin) * 2;
  const outerH = height + (padding + border + margin) * 2;

  function copy() {
    void navigator.clipboard.writeText(css).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="grid place-items-center overflow-auto rounded-md border border-border bg-background/40 p-6">
        <div className="relative">
          <Layer label={`margin ${margin}px`} color="bg-yellow-500/20" pad={margin}>
            <Layer label={`border ${border}px`} color="bg-orange-500/30" pad={border}>
              <Layer label={`padding ${padding}px`} color="bg-emerald-500/25" pad={padding}>
                <div
                  className="grid place-items-center bg-ring/30 font-mono text-xs"
                  style={{ width, height }}
                >
                  content
                </div>
              </Layer>
            </Layer>
          </Layer>
          <p className="mt-3 text-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            outer · {outerW} × {outerH}px
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        <SliderRow label="Width" value={width} min={50} max={400} onChange={setWidth} />
        <SliderRow label="Height" value={height} min={20} max={300} onChange={setHeight} />
        <SliderRow label="Padding" value={padding} min={0} max={80} onChange={setPadding} />
        <SliderRow label="Border" value={border} min={0} max={20} onChange={setBorder} />
        <SliderRow label="Margin" value={margin} min={0} max={80} onChange={setMargin} />
        <div className="grid gap-1.5">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">CSS</label>
          <div className="flex items-start gap-2">
            <pre className="flex-1 overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[0.7rem] leading-5">
{css}
            </pre>
            <Button type="button" size="sm" variant="outline" onClick={copy}>
              <Copy className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layer({
  label,
  color,
  pad,
  children,
}: {
  label: string;
  color: string;
  pad: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${color}`} style={{ padding: pad }}>
      <span className="absolute left-1 top-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}px</span>
      </div>
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
