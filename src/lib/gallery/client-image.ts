// Browser-only image helpers for gallery uploads. Canvas-based: downscale a
// picked photo to a lean WebP, capture its output dimensions, and produce a
// tiny LQIP data-URL — the same treatment ImageDropzone applies per file, so
// batch uploads store consistent, web-safe originals and the public gallery
// can reserve space (no layout shift). Import only from client components.

const OPTIMIZE_MAX_EDGE = 2400;
const OPTIMIZE_QUALITY = 0.85;

export interface OptimizedImage {
  file: File;
  width: number;
  height: number;
  blurDataUrl: string;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function resizeToWebp(
  img: HTMLImageElement,
  fileName: string,
): Promise<{ file: File; width: number; height: number } | null> {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return Promise.resolve(null);
  const scale = Math.min(1, OPTIMIZE_MAX_EDGE / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * scale));
  const h = Math.max(1, Math.round(nh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const base = fileName.replace(/\.[^.]+$/, "").trim() || "image";
        resolve({
          file: new File([blob], `${base}.webp`, { type: "image/webp" }),
          width: w,
          height: h,
        });
      },
      "image/webp",
      OPTIMIZE_QUALITY,
    );
  });
}

function makeBlurDataUrl(img: HTMLImageElement): string {
  const MAX_EDGE = 20;
  const ratio = img.naturalWidth / img.naturalHeight || 1;
  const w = ratio >= 1 ? MAX_EDGE : Math.max(1, Math.round(MAX_EDGE * ratio));
  const h = ratio >= 1 ? Math.max(1, Math.round(MAX_EDGE / ratio)) : MAX_EDGE;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, 0, 0, w, h);
  try {
    return canvas.toDataURL("image/jpeg", 0.4);
  } catch {
    return "";
  }
}

/**
 * Decode → downscale to WebP → capture dimensions + LQIP. Returns null if the
 * file can't be decoded or the canvas API is unavailable.
 */
export async function optimizeImageFile(
  file: File,
): Promise<OptimizedImage | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img) return null;
    const blurDataUrl = makeBlurDataUrl(img);
    const resized = await resizeToWebp(img, file.name);
    if (!resized) return null;
    return { ...resized, blurDataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}
