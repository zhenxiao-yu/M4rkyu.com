/**
 * Median-cut color quantization for the color-palette tool.
 *
 * Pure + framework-free so it can run on any RGBA pixel buffer (canvas
 * `getImageData().data`) and be unit-tested without a DOM. The component
 * owns the file reading / canvas downscaling; this owns only the math.
 *
 * Returns up to `count` dominant colors as `#rrggbb` strings, ordered by
 * how many sampled pixels fell into each bucket (most prominent first).
 */

type Rgb = [number, number, number];

interface Box {
  pixels: Rgb[];
}

export interface PaletteSwatch {
  hex: string;
  /** Number of sampled pixels that fell into this bucket. */
  count: number;
}

function clampCount(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.max(1, Math.min(64, Math.floor(count)));
}

function widestChannel(pixels: Rgb[]): 0 | 1 | 2 {
  let minR = 255,
    maxR = 0,
    minG = 255,
    maxG = 0,
    minB = 255,
    maxB = 0;
  for (const p of pixels) {
    if (p[0] < minR) minR = p[0];
    if (p[0] > maxR) maxR = p[0];
    if (p[1] < minG) minG = p[1];
    if (p[1] > maxG) maxG = p[1];
    if (p[2] < minB) minB = p[2];
    if (p[2] > maxB) maxB = p[2];
  }
  const rangeR = maxR - minR;
  const rangeG = maxG - minG;
  const rangeB = maxB - minB;
  if (rangeR >= rangeG && rangeR >= rangeB) return 0;
  if (rangeG >= rangeB) return 1;
  return 2;
}

function toHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Quantize an RGBA pixel buffer into `count` dominant swatches with counts.
 * Fully transparent (alpha < 128) pixels are skipped.
 */
export function quantizePalette(
  pixels: Uint8ClampedArray,
  count: number,
): PaletteSwatch[] {
  const target = clampCount(count);
  const initial: Rgb[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 128) continue; // skip mostly-transparent
    initial.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
  }
  if (initial.length === 0) return [];

  const boxes: Box[] = [{ pixels: initial }];

  // Split the largest box along its widest channel until we hit `target`
  // (or can't split further — fewer-than-target distinct buckets is fine).
  while (boxes.length < target) {
    let toSplit = -1;
    let largest = 1; // a box must have >= 2 pixels to split
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length > largest) {
        largest = boxes[i].pixels.length;
        toSplit = i;
      }
    }
    if (toSplit < 0) break;
    const box = boxes[toSplit];
    const channel = widestChannel(box.pixels);
    box.pixels.sort((a, b) => a[channel] - b[channel]);
    const mid = box.pixels.length >> 1;
    boxes.splice(
      toSplit,
      1,
      { pixels: box.pixels.slice(0, mid) },
      { pixels: box.pixels.slice(mid) },
    );
  }

  return boxes
    .map((box) => {
      let r = 0,
        g = 0,
        b = 0;
      for (const p of box.pixels) {
        r += p[0];
        g += p[1];
        b += p[2];
      }
      const n = Math.max(1, box.pixels.length);
      return { hex: toHex(r / n, g / n, b / n), count: box.pixels.length };
    })
    .sort((a, b) => b.count - a.count);
}

/**
 * Convenience wrapper returning just the hex strings, deduplicated while
 * preserving prominence order. This is the signature the tool consumes for
 * its swatch list and the unit test asserts against.
 */
export function extractPalette(
  pixels: Uint8ClampedArray,
  count: number,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const swatch of quantizePalette(pixels, count)) {
    if (seen.has(swatch.hex)) continue;
    seen.add(swatch.hex);
    out.push(swatch.hex);
  }
  return out;
}
