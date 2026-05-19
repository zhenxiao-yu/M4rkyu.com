"use client";

import { useMemo, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Point {
  x: number;
  y: number;
}

const PRESETS: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  premium: [0.2, 0.7, 0.2, 1],
};

export function CubicBezier() {
  const [p1, setP1] = useState<Point>({ x: 0.42, y: 0 });
  const [p2, setP2] = useState<Point>({ x: 0.58, y: 1 });
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<"p1" | "p2" | null>(null);

  const css = useMemo(
    () => `cubic-bezier(${round(p1.x)}, ${round(p1.y)}, ${round(p2.x)}, ${round(p2.y)})`,
    [p1, p2],
  );

  function round(n: number) {
    return Math.round(n * 1000) / 1000;
  }

  function startDragP1() {
    dragging.current = "p1";
  }
  function startDragP2() {
    dragging.current = "p2";
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    // SVG viewBox is 0..1 horizontal, allow some over/under-shoot vertically (-0.5..1.5)
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(-0.5, Math.min(1.5, 1 - (event.clientY - rect.top) / rect.height));
    if (dragging.current === "p1") setP1({ x, y });
    else setP2({ x, y });
  }
  function onPointerUp() {
    dragging.current = null;
  }

  function svgY(y: number) {
    return (1 - y) * 200;
  }
  function svgX(x: number) {
    return x * 200;
  }

  function copy() {
    void navigator.clipboard.writeText(css).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="grid gap-3">
        <div className="aspect-square w-full max-w-md rounded-md border border-border bg-background/40">
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            preserveAspectRatio="xMidYMid meet"
            className="block h-full w-full touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* baseline grid */}
            <rect x="0" y="0" width="200" height="200" fill="transparent" />
            {[0, 50, 100, 150, 200].map((v) => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="200" stroke="currentColor" strokeOpacity={0.1} className="text-muted-foreground" />
                <line x1="0" y1={v} x2="200" y2={v} stroke="currentColor" strokeOpacity={0.1} className="text-muted-foreground" />
              </g>
            ))}
            {/* handle lines */}
            <line x1={0} y1={svgY(0)} x2={svgX(p1.x)} y2={svgY(p1.y)} className="stroke-muted-foreground" strokeOpacity={0.4} strokeDasharray="3 3" />
            <line x1={200} y1={svgY(1)} x2={svgX(p2.x)} y2={svgY(p2.y)} className="stroke-muted-foreground" strokeOpacity={0.4} strokeDasharray="3 3" />
            {/* the curve */}
            <path
              d={`M 0 ${svgY(0)} C ${svgX(p1.x)} ${svgY(p1.y)}, ${svgX(p2.x)} ${svgY(p2.y)}, 200 ${svgY(1)}`}
              fill="none"
              strokeWidth={2.5}
              className="stroke-ring"
            />
            {/* handles */}
            <circle
              cx={svgX(p1.x)}
              cy={svgY(p1.y)}
              r={8}
              className="cursor-grab fill-ring/30 stroke-ring"
              onPointerDown={startDragP1}
            />
            <circle
              cx={svgX(p2.x)}
              cy={svgY(p2.y)}
              r={8}
              className="cursor-grab fill-ring/30 stroke-ring"
              onPointerDown={startDragP2}
            />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
            {css}
          </code>
          <Button type="button" size="sm" variant="outline" onClick={copy}>
            <Copy className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Presets
        </label>
        <div className="grid gap-1.5">
          {Object.entries(PRESETS).map(([name, [a, b, c, d]]) => (
            <Button
              key={name}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setP1({ x: a, y: b });
                setP2({ x: c, y: d });
              }}
              className="justify-start font-mono text-xs"
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
