// Pure, dependency-free crop geometry for the admin image cropper, plus a
// browser-only canvas crop. The geometry functions are DOM-free and
// unit-tested (tests/unit/gallery/crop.test.ts); only `cropFileToAspect`
// touches the canvas. Import the canvas helper from client components only.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Bounds {
  w: number;
  h: number;
}

export type CropHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

// Min crop size: the larger of 32px or 1% of the shorter bound, so the box
// can't collapse to nothing on either a tiny preview or a huge image.
const MIN_FRACTION = 0.01;
const MIN_PX = 32;

function minSize(bounds: Bounds): number {
  return Math.max(MIN_PX, Math.min(bounds.w, bounds.h) * MIN_FRACTION);
}

/** Parse a `"W/H"` aspect token to a numeric ratio. `"free"` → null. */
export function parseAspectRatio(value: string): number | null {
  if (value === "free") return null;
  const [w, h] = value.split("/").map(Number);
  if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h)) return null;
  return w / h;
}

/**
 * Largest centered rect of `ratio` that fits inside an `imgW`×`imgH` box.
 * `null` ratio returns the full box (free crop start).
 */
export function fitRect(imgW: number, imgH: number, ratio: number | null): Rect {
  if (ratio == null) return { x: 0, y: 0, w: imgW, h: imgH };
  let w = imgW;
  let h = w / ratio;
  if (h > imgH) {
    h = imgH;
    w = h * ratio;
  }
  return { x: (imgW - w) / 2, y: (imgH - h) / 2, w, h };
}

/** Keep a rect fully inside `bounds` (clamp size first, then position). */
export function clampRect(rect: Rect, bounds: Bounds): Rect {
  const w = Math.min(rect.w, bounds.w);
  const h = Math.min(rect.h, bounds.h);
  const x = Math.min(Math.max(0, rect.x), bounds.w - w);
  const y = Math.min(Math.max(0, rect.y), bounds.h - h);
  return { x, y, w, h };
}

/** Translate a rect by (dx, dy), clamped to stay inside `bounds`. */
export function moveRect(rect: Rect, dx: number, dy: number, bounds: Bounds): Rect {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds);
}

/**
 * Resize a rect by dragging `handle` by (dx, dy). An aspect `ratio` (or null
 * for free) locks the box; the dependent dimension is derived from the axis the
 * handle drives. Enforces a minimum size and clamps to `bounds`.
 */
export function resizeRect(
  rect: Rect,
  handle: CropHandle,
  dx: number,
  dy: number,
  ratio: number | null,
  bounds: Bounds,
): Rect {
  const min = minSize(bounds);
  let { x, y, w, h } = rect;
  const right = x + w;
  const bottom = y + h;

  const west = handle.includes("w");
  const east = handle.includes("e");
  const north = handle.includes("n");
  const south = handle.includes("s");

  if (west) {
    x = Math.min(x + dx, right - min);
    w = right - x;
  }
  if (east) w = Math.max(min, w + dx);
  if (north) {
    y = Math.min(y + dy, bottom - min);
    h = bottom - y;
  }
  if (south) h = Math.max(min, h + dy);

  if (ratio != null) {
    // Aspect-locked: a horizontal-driving handle sets height from width, and a
    // vertical-only handle sets width from height. Anchor the opposite edge.
    if (east || west) {
      h = w / ratio;
      if (north) y = bottom - h;
    } else {
      w = h * ratio;
      if (west) x = right - w;
    }
  }

  return clampRect({ x, y, w, h }, bounds);
}

/**
 * Crop `file` to `sourceRect` (in SOURCE pixels) using the already-decoded
 * `sourceImg`, at full resolution capped at 4000px longest edge (guards
 * low-end-device OOM; still well above the 2400px the optimizer downscales to).
 * Output PNG so the single downstream WebP re-encode stays the only lossy step.
 * The browser auto-orients the `<img>` on decode, so drawImage is already
 * upright — no manual EXIF rotation (that would double-correct). Falls back to
 * the original file if the canvas API is unavailable.
 */
export async function cropFileToAspect(
  file: File,
  sourceRect: Rect,
  sourceImg: HTMLImageElement,
): Promise<File> {
  const MAX_EDGE = 4000;
  const sw = Math.max(1, Math.round(sourceRect.w));
  const sh = Math.max(1, Math.round(sourceRect.h));
  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const cw = Math.max(1, Math.round(sw * scale));
  const ch = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(
    sourceImg,
    Math.round(sourceRect.x),
    Math.round(sourceRect.y),
    sw,
    sh,
    0,
    0,
    cw,
    ch,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) =>
        resolve(blob ? new File([blob], file.name, { type: blob.type }) : file),
      "image/png",
    );
  });
}
