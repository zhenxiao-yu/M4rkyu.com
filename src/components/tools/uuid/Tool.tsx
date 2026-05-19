"use client";

import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function generate(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}

export function UuidGenerator() {
  const [count, setCount] = useState(8);
  const [values, setValues] = useState(() => generate(8));

  function regenerate() {
    setValues(generate(count));
  }

  function copyAll() {
    void navigator.clipboard
      .writeText(values.join("\n"))
      .then(() => toast.success(`Copied ${values.length} UUIDs`))
      .catch(() => toast.error("Copy failed"));
  }

  function copyOne(v: string) {
    void navigator.clipboard.writeText(v).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Count</span>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
        <Button type="button" size="sm" onClick={regenerate}>
          <RefreshCw className="size-3.5" aria-hidden="true" /> Generate
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copyAll} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy all
        </Button>
      </div>
      <ul className="grid gap-1 rounded-md border border-border bg-card/40 p-2">
        {values.map((v) => (
          <li key={v}>
            <button
              type="button"
              onClick={() => copyOne(v)}
              className="block w-full rounded-sm px-2 py-1 text-left font-mono text-xs text-foreground transition-colors hover:bg-muted"
            >
              {v}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[0.65rem] text-muted-foreground/70">v4 (random) via crypto.randomUUID().</p>
    </div>
  );
}
