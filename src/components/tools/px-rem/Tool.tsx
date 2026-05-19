"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COMMON = [12, 14, 16, 20, 24, 32, 48];

export function PxRemConverter() {
  const [base, setBase] = useState(16);
  const [px, setPx] = useState(24);

  const rem = px / base;
  const em = rem; // same math, just labelled differently

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Base size (px)" value={base} onChange={setBase} />
        <Field label="Pixels" value={px} onChange={setPx} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Result
          label="rem"
          value={`${rem.toFixed(4).replace(/\.?0+$/, "")}rem`}
          onCopy={() => copy(`${rem}rem`, "rem")}
        />
        <Result
          label="em"
          value={`${em.toFixed(4).replace(/\.?0+$/, "")}em`}
          onCopy={() => copy(`${em}em`, "em")}
        />
      </div>
      <div className="grid gap-2 rounded-md border border-border bg-card/40 p-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Quick ladder (base {base})
        </p>
        <table className="text-xs">
          <thead className="text-muted-foreground">
            <tr>
              <th className="px-2 py-1 text-left font-mono">px</th>
              <th className="px-2 py-1 text-left font-mono">rem</th>
              <th className="px-2 py-1 text-left font-mono">tailwind</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {COMMON.map((v) => (
              <tr key={v} className="border-t border-border/40">
                <td className="px-2 py-1">{v}</td>
                <td className="px-2 py-1">{(v / base).toString()}rem</td>
                <td className="px-2 py-1 text-muted-foreground">{tailwindFor(v / base)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function tailwindFor(rem: number) {
  const map: Record<number, string> = {
    0.75: "text-xs",
    0.875: "text-sm",
    1: "text-base",
    1.25: "text-xl",
    1.5: "text-2xl",
    2: "text-4xl",
    3: "text-5xl",
  };
  return map[rem] ?? `[font-size:${rem}rem]`;
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        value={value}
        min={1}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="font-mono"
      />
    </label>
  );
}

function Result({
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
        <code className="flex-1 truncate rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-sm">
          {value}
        </code>
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
