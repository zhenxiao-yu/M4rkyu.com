"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// box-shadow builder. Native range inputs (no shadcn slider needed).
// Live preview + CSS / Tailwind copy. ~3 KB gzipped.

interface ShadowState {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

function buildShadow(s: ShadowState) {
  const inset = s.inset ? "inset " : "";
  return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`;
}

function buildTailwind(s: ShadowState) {
  return `shadow-[${s.inset ? "inset_" : ""}${s.x}px_${s.y}px_${s.blur}px_${s.spread}px_${s.color.replace(/\s/g, "")}]`;
}

export function ShadowGenerator() {
  const [state, setState] = useState<ShadowState>({
    x: 0,
    y: 12,
    blur: 32,
    spread: -8,
    color: "rgba(15, 23, 42, 0.25)",
    inset: false,
  });

  const css = buildShadow(state);
  const tailwind = buildTailwind(state);

  function update<K extends keyof ShadowState>(key: K, value: ShadowState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function copy(text: string, label: string) {
    void navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Copied ${label}`))
      .catch(() => toast.error("Copy failed"));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="grid gap-5 rounded-md border border-border/60 bg-background/40 p-8">
        <div className="grid place-items-center">
          <div
            aria-label="Shadow preview"
            className="size-40 rounded-xl bg-card sm:size-52"
            style={{ boxShadow: css }}
          />
        </div>
        <div className="grid gap-2">
          <CopyField
            label="CSS"
            value={`box-shadow: ${css};`}
            onCopy={() => copy(`box-shadow: ${css};`, "CSS")}
          />
          <CopyField
            label="Tailwind"
            value={tailwind}
            onCopy={() => copy(tailwind, "Tailwind class")}
          />
        </div>
      </div>

      <div className="grid gap-4">
        <SliderRow
          label="Offset X"
          value={state.x}
          min={-50}
          max={50}
          onChange={(value) => update("x", value)}
          unit="px"
        />
        <SliderRow
          label="Offset Y"
          value={state.y}
          min={-50}
          max={50}
          onChange={(value) => update("y", value)}
          unit="px"
        />
        <SliderRow
          label="Blur"
          value={state.blur}
          min={0}
          max={100}
          onChange={(value) => update("blur", value)}
          unit="px"
        />
        <SliderRow
          label="Spread"
          value={state.spread}
          min={-30}
          max={30}
          onChange={(value) => update("spread", value)}
          unit="px"
        />
        <div className="grid gap-1.5">
          <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            Color
          </label>
          <Input
            value={state.color}
            onChange={(event) => update("color", event.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="font-mono text-xs"
          />
          <p className="text-[0.65rem] text-muted-foreground/70">
            Any CSS color: hex, rgb(), rgba(), hsl(), var(--ring), …
          </p>
        </div>
        <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={state.inset}
            onChange={(event) => update("inset", event.target.checked)}
            className="size-4 rounded border-border accent-ring"
          />
          <span>Inset</span>
        </label>
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
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums">
          {value}
          {unit ? <span className="ml-0.5 text-muted-foreground">{unit}</span> : null}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
      />
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
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-border/60 bg-card/80 px-3 py-2 font-mono text-xs">
          {value}
        </code>
        <Button
          type="button"
          onClick={onCopy}
          variant="outline"
          size="sm"
          aria-label={`Copy ${label}`}
        >
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
