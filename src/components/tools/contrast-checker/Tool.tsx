"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// WCAG contrast checker — paste two colors, see AA/AAA pass/fail for
// normal + large text. Pure client logic, ~3 KB gzipped, no deps.

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function parseHex(input: string): [number, number, number] | null {
  const match = HEX.exec(input.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const num = parseInt(hex, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const transform = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

interface PassResult {
  level: string;
  threshold: number;
  pass: boolean;
}

export function ContrastChecker() {
  const [fgInput, setFgInput] = useState("#0f172a");
  const [bgInput, setBgInput] = useState("#f8fafc");

  const fg = useMemo(() => parseHex(fgInput), [fgInput]);
  const bg = useMemo(() => parseHex(bgInput), [bgInput]);
  const ratio = fg && bg ? contrastRatio(fg, bg) : null;

  const results: PassResult[] = ratio
    ? [
        { level: "AA · normal", threshold: 4.5, pass: ratio >= 4.5 },
        { level: "AA · large", threshold: 3, pass: ratio >= 3 },
        { level: "AAA · normal", threshold: 7, pass: ratio >= 7 },
        { level: "AAA · large", threshold: 4.5, pass: ratio >= 4.5 },
      ]
    : [];

  const fgHex = fg ? `#${fg.map(toHex).join("")}` : null;
  const bgHex = bg ? `#${bg.map(toHex).join("")}` : null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ColorField
          label="Foreground"
          value={fgInput}
          onChange={setFgInput}
          parsed={fgHex}
        />
        <ColorField
          label="Background"
          value={bgInput}
          onChange={setBgInput}
          parsed={bgHex}
        />
      </div>

      <div
        className="grid place-items-center rounded-md border border-border/60 px-6 py-10 text-center"
        style={
          bgHex && fgHex
            ? { backgroundColor: bgHex, color: fgHex }
            : undefined
        }
      >
        <div className="grid gap-2">
          <p className="text-2xl font-semibold">The quick brown fox</p>
          <p className="text-base">jumps over the lazy dog · 12pt body</p>
          <p className="text-xs font-mono opacity-80">
            sample preview · adjust either side
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:items-start">
        <div className="grid gap-1 rounded-md border border-border/60 bg-background/40 p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            contrast
          </p>
          <p className="font-display text-3xl tabular-nums leading-none">
            {ratio ? `${ratio.toFixed(2)}:1` : "—"}
          </p>
        </div>
        <ul className="grid gap-1.5">
          {results.map((result) => (
            <li
              key={result.level}
              className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 place-items-center rounded-full",
                    result.pass
                      ? "bg-ring/15 text-ring"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {result.pass ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                </span>
                <span>{result.level}</span>
              </span>
              <Badge
                variant={result.pass ? "success" : "outline"}
                className="font-mono text-[0.6rem]"
              >
                ≥ {result.threshold}
              </Badge>
            </li>
          ))}
          {!ratio ? (
            <li className="rounded-md border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
              Enter two valid hex colors (e.g. `#1a1a1a` and `#fafafa`).
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  parsed,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  parsed: string | null;
}) {
  return (
    <label className="grid gap-2 text-xs text-muted-foreground">
      <span className="font-mono uppercase tracking-[0.18em]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={parsed ?? "#000000"}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} picker`}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#0f172a"
          aria-label={`${label} hex value`}
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </label>
  );
}

function toHex(n: number) {
  return n.toString(16).padStart(2, "0");
}
