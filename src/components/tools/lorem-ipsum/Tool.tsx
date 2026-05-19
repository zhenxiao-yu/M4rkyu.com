"use client";

import { useMemo, useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum").split(" ");

function pick(rng: () => number) {
  return WORDS[Math.floor(rng() * WORDS.length)];
}
function sentence(rng: () => number, words: number) {
  const out = Array.from({ length: words }, () => pick(rng)).join(" ");
  return out[0].toUpperCase() + out.slice(1) + ".";
}
function paragraph(rng: () => number, sentences: number) {
  return Array.from({ length: sentences }, () => sentence(rng, 7 + Math.floor(rng() * 12))).join(" ");
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function LoremIpsum() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));

  const output = useMemo(() => {
    const rng = seededRandom(seed);
    if (unit === "words") return Array.from({ length: count }, () => pick(rng)).join(" ");
    if (unit === "sentences") return Array.from({ length: count }, () => sentence(rng, 8 + Math.floor(rng() * 10))).join(" ");
    return Array.from({ length: count }, () => paragraph(rng, 3 + Math.floor(rng() * 3))).join("\n\n");
  }, [unit, count, seed]);

  function copy() {
    void navigator.clipboard.writeText(output).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["paragraphs", "sentences", "words"] as const).map((u) => (
            <button
              key={u}
              role="tab"
              type="button"
              aria-selected={unit === u}
              onClick={() => setUnit(u)}
              className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] ${unit === u ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {u}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Count</span>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            className="w-20 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
        <Button type="button" size="sm" variant="outline" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
          <RefreshCw className="size-3.5" aria-hidden="true" /> Reroll
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copy} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        readOnly
        value={output}
        rows={12}
        className="w-full rounded-md border border-border bg-card/40 px-3 py-2 text-sm leading-6"
      />
    </div>
  );
}
