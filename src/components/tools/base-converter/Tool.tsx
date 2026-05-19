"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BASES = [2, 8, 10, 16] as const;
type Base = (typeof BASES)[number];
const LABELS: Record<Base, string> = { 2: "binary", 8: "octal", 10: "decimal", 16: "hex" };

function bigIntFromBase(raw: string, base: Base): bigint | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^0[bxo]/i, "").replace(/_/g, "").trim().toLowerCase();
  if (!cleaned) return null;
  const digits = "0123456789abcdef";
  let result = 0n;
  for (const ch of cleaned) {
    const v = digits.indexOf(ch);
    if (v < 0 || v >= base) return null;
    result = result * BigInt(base) + BigInt(v);
  }
  return result;
}

function toBase(value: bigint, base: Base): string {
  return value.toString(base);
}

export function BaseConverter() {
  const [drafts, setDrafts] = useState<Record<Base, string>>({
    2: "1010",
    8: "12",
    10: "10",
    16: "a",
  });

  function handleChange(base: Base, raw: string) {
    const next = { ...drafts, [base]: raw };
    const value = bigIntFromBase(raw, base);
    if (value !== null) {
      for (const other of BASES) {
        if (other !== base) next[other] = toBase(value, other);
      }
    }
    setDrafts(next);
  }

  function copy(base: Base) {
    void navigator.clipboard
      .writeText(drafts[base])
      .then(() => toast.success(`Copied ${LABELS[base]}`));
  }

  return (
    <div className="grid gap-3">
      {BASES.map((base) => {
        const valid = bigIntFromBase(drafts[base], base) !== null || drafts[base] === "";
        return (
          <div key={base} className="grid gap-1.5">
            <label className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>
                {LABELS[base]} · base {base}
              </span>
              {!valid && <span className="text-destructive normal-case">invalid character</span>}
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={drafts[base]}
                onChange={(e) => handleChange(base, e.target.value)}
                spellCheck={false}
                className={`font-mono ${valid ? "" : "border-destructive/50"}`}
              />
              <Button type="button" size="sm" variant="outline" onClick={() => copy(base)}>
                <Copy className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}
      <p className="text-[0.65rem] text-muted-foreground/70">
        Underscores (<code>_</code>) and prefixes (<code>0b</code>, <code>0o</code>, <code>0x</code>) are accepted. Uses BigInt so large values stay precise.
      </p>
    </div>
  );
}
