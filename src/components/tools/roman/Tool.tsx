"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VALUES: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let out = "";
  for (const [v, sym] of VALUES) {
    while (n >= v) {
      out += sym;
      n -= v;
    }
  }
  return out;
}

function fromRoman(s: string): number | null {
  const trimmed = s.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(trimmed)) return null;
  let total = 0;
  let i = 0;
  while (i < trimmed.length) {
    const two = trimmed.slice(i, i + 2);
    const matchTwo = VALUES.find(([, sym]) => sym === two);
    if (matchTwo) {
      total += matchTwo[0];
      i += 2;
      continue;
    }
    const one = trimmed[i];
    const matchOne = VALUES.find(([, sym]) => sym === one);
    if (!matchOne) return null;
    total += matchOne[0];
    i += 1;
  }
  if (toRoman(total) !== trimmed) return null;
  return total;
}

export function RomanNumeral() {
  const [num, setNum] = useState("2026");
  const [roman, setRoman] = useState("MMXXVI");

  function handleNum(value: string) {
    setNum(value);
    const parsed = Number(value);
    const r = Number.isFinite(parsed) ? toRoman(parsed) : null;
    if (r !== null) setRoman(r);
  }

  function handleRoman(value: string) {
    setRoman(value);
    const n = fromRoman(value);
    if (n !== null) setNum(String(n));
  }

  const numericValid = useMemo(() => toRoman(Number(num)) !== null, [num]);
  const romanValid = useMemo(() => fromRoman(roman) !== null, [roman]);

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Number (1–3999)"
          value={num}
          valid={numericValid || num === ""}
          onChange={handleNum}
          onCopy={() => copy(num, "number")}
        />
        <Field
          label="Roman"
          value={roman}
          valid={romanValid || roman === ""}
          onChange={handleRoman}
          onCopy={() => copy(roman, "roman")}
        />
      </div>
      <p className="text-[0.65rem] text-muted-foreground/70">
        Roman numerals are validated for canonical form (no double subtractive, no rank repetition over 3).
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  valid,
  onChange,
  onCopy,
}: {
  label: string;
  value: string;
  valid: boolean;
  onChange: (v: string) => void;
  onCopy: () => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={`font-mono text-lg ${valid ? "" : "border-destructive/50"}`}
        />
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </label>
  );
}
