"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Glassmorphism() {
  const [blur, setBlur] = useState(14);
  const [saturation, setSaturation] = useState(180);
  const [bgAlpha, setBgAlpha] = useState(0.25);
  const [borderAlpha, setBorderAlpha] = useState(0.18);
  const [radius, setRadius] = useState(16);
  const [bgColor, setBgColor] = useState("#ffffff");

  const rgb = hexToRgb(bgColor);
  const css = useMemo(() => {
    return [
      `background: rgba(${rgb}, ${bgAlpha.toFixed(2)});`,
      `backdrop-filter: blur(${blur}px) saturate(${saturation}%);`,
      `-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);`,
      `border: 1px solid rgba(${rgb}, ${borderAlpha.toFixed(2)});`,
      `border-radius: ${radius}px;`,
    ].join("\n");
  }, [rgb, bgAlpha, blur, saturation, borderAlpha, radius]);

  const preview: React.CSSProperties = {
    background: `rgba(${rgb}, ${bgAlpha})`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid rgba(${rgb}, ${borderAlpha})`,
    borderRadius: `${radius}px`,
  };

  function copy() {
    void navigator.clipboard.writeText(css).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div
        className="relative aspect-[16/9] overflow-hidden rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, #f472b6 0%, #fb923c 35%, #38bdf8 100%)",
        }}
      >
        <div className="absolute inset-0 grid place-items-center p-6">
          <div className="grid h-3/4 w-3/4 place-items-center p-6 text-center font-mono text-sm text-foreground" style={preview}>
            Glass card · drag the sliders →
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        <SliderRow label="Blur" value={blur} min={0} max={40} onChange={setBlur} suffix="px" />
        <SliderRow label="Saturation" value={saturation} min={0} max={300} onChange={setSaturation} suffix="%" />
        <SliderRow label="BG alpha" value={Math.round(bgAlpha * 100)} min={0} max={100} onChange={(v) => setBgAlpha(v / 100)} suffix="%" />
        <SliderRow label="Border α" value={Math.round(borderAlpha * 100)} min={0} max={100} onChange={(v) => setBorderAlpha(v / 100)} suffix="%" />
        <SliderRow label="Radius" value={radius} min={0} max={48} onChange={setRadius} suffix="px" />
        <label className="grid gap-1.5 text-sm">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Tint</span>
          <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-full cursor-pointer p-1" />
        </label>
      </div>
      <div className="lg:col-span-2">
        <div className="flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs leading-5">
{css}
          </pre>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            <Copy className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}{suffix ?? ""}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
      />
    </div>
  );
}

function hexToRgb(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "255, 255, 255";
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 0xff}, ${(n >> 8) & 0xff}, ${n & 0xff}`;
}
