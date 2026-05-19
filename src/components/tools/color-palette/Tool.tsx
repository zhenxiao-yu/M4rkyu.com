"use client";

import { useRef, useState } from "react";
import { Copy, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Swatch {
  hex: string;
  count: number;
}

// Median-cut color quantization — small (~80 LOC), runs entirely in the
// browser on a canvas-downsampled copy of the upload. Returns the N
// most-prominent colors as hex strings + their pixel counts.
function quantize(pixels: Uint8ClampedArray, target: number): Swatch[] {
  type Box = { pixels: number[][]; channel: 0 | 1 | 2 };
  const buckets: Box[] = [];
  const initial: number[][] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue; // skip transparent
    initial.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }
  if (initial.length === 0) return [];
  buckets.push({ pixels: initial, channel: 0 });

  while (buckets.length < target) {
    let toSplit = -1;
    let largest = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].pixels.length > largest) {
        largest = buckets[i].pixels.length;
        toSplit = i;
      }
    }
    if (toSplit < 0) break;
    const box = buckets[toSplit];
    if (box.pixels.length < 2) break;
    const widest = widestChannel(box.pixels);
    box.pixels.sort((a, b) => a[widest] - b[widest]);
    const mid = box.pixels.length >> 1;
    const left = box.pixels.slice(0, mid);
    const right = box.pixels.slice(mid);
    buckets.splice(toSplit, 1, { pixels: left, channel: widest }, { pixels: right, channel: widest });
  }

  return buckets.map((box) => {
    let r = 0, g = 0, b = 0;
    for (const p of box.pixels) {
      r += p[0];
      g += p[1];
      b += p[2];
    }
    const n = Math.max(1, box.pixels.length);
    return {
      hex: rgbToHex(Math.round(r / n), Math.round(g / n), Math.round(b / n)),
      count: box.pixels.length,
    };
  }).sort((a, b) => b.count - a.count);
}

function widestChannel(pixels: number[][]): 0 | 1 | 2 {
  let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
  for (const p of pixels) {
    if (p[0] < minR) minR = p[0]; if (p[0] > maxR) maxR = p[0];
    if (p[1] < minG) minG = p[1]; if (p[1] > maxG) maxG = p[1];
    if (p[2] < minB) minB = p[2]; if (p[2] > maxB) maxB = p[2];
  }
  const rR = maxR - minR, rG = maxG - minG, rB = maxB - minB;
  if (rR >= rG && rR >= rB) return 0;
  if (rG >= rB) return 1;
  return 2;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

const MAX_DIM = 200;

export function ColorPalette() {
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState(6);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h).data;
    const result = quantize(pixels, count);
    setSwatches(result);
  }

  function copyAll() {
    if (swatches.length === 0) return;
    const text = swatches.map((s) => s.hex).join("\n");
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${swatches.length} colors`));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Colors</span>
          <input
            type="number"
            min={2}
            max={16}
            value={count}
            onChange={(e) => setCount(Math.max(2, Math.min(16, Number(e.target.value) || 6)))}
            className="w-16 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          />
        </label>
        <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="size-3.5" aria-hidden="true" /> Pick image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="hidden"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copyAll}
          disabled={swatches.length === 0}
          className="ml-auto"
        >
          <Copy className="size-3.5" aria-hidden="true" /> Copy hex
        </Button>
      </div>
      {preview ? (
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, optimization not applicable */}
          <img src={preview} alt="" className="max-h-72 w-full rounded-md border border-border object-contain bg-card/40" />
          <ul className="grid gap-2">
            {swatches.map((s) => (
              <li
                key={s.hex}
                className="flex items-center gap-3 rounded-md border border-border bg-card/40 p-2"
              >
                <span className="size-10 shrink-0 rounded-md border border-border/60" style={{ background: s.hex }} />
                <code className="font-mono text-sm">{s.hex}</code>
                <span className="ml-auto font-mono text-[0.65rem] text-muted-foreground">{s.count.toLocaleString()}px</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(s.hex).then(() => toast.success(`Copied ${s.hex}`));
                  }}
                  aria-label={`Copy ${s.hex}`}
                >
                  <Copy className="size-3" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid place-items-center rounded-md border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
          Drop or pick an image to extract its dominant colors. Nothing leaves the browser.
        </div>
      )}
    </div>
  );
}
