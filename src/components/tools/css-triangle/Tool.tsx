"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Direction = "up" | "down" | "left" | "right";
const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

function build(direction: Direction, size: number, color: string) {
  const s = `${size}px`;
  switch (direction) {
    case "up":
      return `width: 0; height: 0; border-left: ${s} solid transparent; border-right: ${s} solid transparent; border-bottom: ${s} solid ${color};`;
    case "down":
      return `width: 0; height: 0; border-left: ${s} solid transparent; border-right: ${s} solid transparent; border-top: ${s} solid ${color};`;
    case "left":
      return `width: 0; height: 0; border-top: ${s} solid transparent; border-bottom: ${s} solid transparent; border-right: ${s} solid ${color};`;
    case "right":
      return `width: 0; height: 0; border-top: ${s} solid transparent; border-bottom: ${s} solid transparent; border-left: ${s} solid ${color};`;
  }
}

function styleFromCss(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  css.split(";").forEach((decl) => {
    const [k, v] = decl.split(":");
    if (!k || !v) return;
    const key = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = v.trim();
  });
  return out as React.CSSProperties;
}

export function CssTriangle() {
  const [direction, setDirection] = useState<Direction>("up");
  const [size, setSize] = useState(48);
  const [color, setColor] = useState("#7c3aed");

  const css = useMemo(() => build(direction, size, color), [direction, size, color]);
  const inline = useMemo(() => styleFromCss(css), [css]);

  function copy() {
    void navigator.clipboard.writeText(css).then(() => toast.success("Copied CSS"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="grid place-items-center rounded-lg border border-border bg-background/40 p-12">
        <div style={inline} />
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Direction
          </label>
          <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={direction === d}
                onClick={() => setDirection(d)}
                className={`rounded-sm px-2.5 py-1 font-mono text-xs uppercase ${direction === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-1.5">
          <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Size</span>
            <span className="tabular-nums">{size}px</span>
          </label>
          <input
            type="range"
            min={8}
            max={200}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            aria-label="Triangle size"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            aria-label="Triangle color"
            className="h-10 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">CSS</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[0.7rem]">
              {css}
            </code>
            <Button type="button" size="sm" variant="outline" onClick={copy} aria-label="Copy CSS">
              <Copy className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
