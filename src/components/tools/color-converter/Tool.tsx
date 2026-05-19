"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

// Three-way Hex ↔ RGB ↔ HSL converter. Editing any field updates the
// other two and the live preview swatch. Pure logic, no deps.

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toHex(n: number) {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHex({ r, g, b }: RGB) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function parseHex(input: string): RGB | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 0xff, g: (num >> 8) & 0xff, b: num & 0xff };
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / delta + 2) * 60;
        break;
      default:
        h = ((rn - gn) / delta + 4) * 60;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = ln - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function parseRgbString(input: string): RGB | null {
  const parts = input
    .replace(/rgba?\(|\)|\s/gi, "")
    .split(/[,/]/)
    .map((part) => parseInt(part, 10));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return {
    r: clamp(parts[0], 0, 255),
    g: clamp(parts[1], 0, 255),
    b: clamp(parts[2], 0, 255),
  };
}

function parseHslString(input: string): HSL | null {
  const parts = input
    .replace(/hsla?\(|\)|%|deg|\s/gi, "")
    .split(/[,/]/)
    .map((part) => parseFloat(part));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return {
    h: ((parts[0] % 360) + 360) % 360,
    s: clamp(parts[1], 0, 100),
    l: clamp(parts[2], 0, 100),
  };
}

function formatRgb(value: RGB) {
  return `rgb(${value.r}, ${value.g}, ${value.b})`;
}

function formatHsl(value: HSL) {
  return `hsl(${value.h}, ${value.s}%, ${value.l}%)`;
}

const INITIAL_RGB: RGB = { r: 124, g: 58, b: 237 };

export function ColorConverter() {
  const [rgb, setRgbState] = useState<RGB>(INITIAL_RGB);
  const [hexInput, setHexInput] = useState(rgbToHex(INITIAL_RGB));
  const [rgbInput, setRgbInput] = useState(formatRgb(INITIAL_RGB));
  const [hslInput, setHslInput] = useState(formatHsl(rgbToHsl(INITIAL_RGB)));

  // Single source of truth for "rgb changed via picker / shade button /
  // another field's commit" — refreshes every input string. No effect:
  // each entry point explicitly fans out, which is what React 19's
  // set-state-in-effect lint rule asks for.
  function commitRgb(next: RGB) {
    setRgbState(next);
    setHexInput(rgbToHex(next));
    setRgbInput(formatRgb(next));
    setHslInput(formatHsl(rgbToHsl(next)));
  }

  function handleHexChange(value: string) {
    setHexInput(value);
    const parsed = parseHex(value);
    if (parsed) commitRgb(parsed);
  }

  function handleRgbChange(value: string) {
    setRgbInput(value);
    const parsed = parseRgbString(value);
    if (parsed) commitRgb(parsed);
  }

  function handleHslChange(value: string) {
    setHslInput(value);
    const parsed = parseHslString(value);
    if (parsed) commitRgb(hslToRgb(parsed));
  }

  function copyToClipboard(text: string, label: string) {
    void navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Copied ${label}`))
      .catch(() => toast.error("Copy failed"));
  }

  const hex = rgbToHex(rgb);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
        <div
          aria-label="Color preview"
          className="aspect-square w-full rounded-md border border-border/60"
          style={{ backgroundColor: hex }}
        />
        <div className="grid gap-2">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              Picker
            </span>
            <input
              type="color"
              value={hex}
              onChange={(event) => {
                const parsed = parseHex(event.target.value);
                if (parsed) commitRgb(parsed);
              }}
              aria-label="Color picker"
              className="h-10 w-full cursor-pointer rounded-md border border-border bg-transparent p-1"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        <ConvertField
          label="Hex"
          value={hexInput}
          onChange={handleHexChange}
          onCopy={() => copyToClipboard(hex, "hex")}
        />
        <ConvertField
          label="RGB"
          value={rgbInput}
          onChange={handleRgbChange}
          onCopy={() =>
            copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")
          }
        />
        <ConvertField
          label="HSL"
          value={hslInput}
          onChange={handleHslChange}
          onCopy={() => {
            const hsl = rgbToHsl(rgb);
            copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "hsl");
          }}
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[15, 35, 50, 65, 85].map((targetL) => {
          const hsl = rgbToHsl(rgb);
          const shade = rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: targetL }));
          return (
            <button
              key={targetL}
              type="button"
              onClick={() => {
                const parsed = parseHex(shade);
                if (parsed) commitRgb(parsed);
              }}
              aria-label={`Use lightness ${targetL}% shade ${shade}`}
              className={cn(
                "grid aspect-square place-items-end rounded-md border border-border/60 p-1.5 text-[0.55rem] font-mono uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5",
                FOCUS_RING_INSET,
              )}
              style={{
                backgroundColor: shade,
                color: targetL > 55 ? "#0a0a0a" : "#fafafa",
              }}
            >
              {targetL}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConvertField({
  label,
  value,
  onChange,
  onCopy,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          className="font-mono"
        />
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
