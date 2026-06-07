"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ImageUp, Loader2, X } from "lucide-react";
import { cn, FOCUS_RING } from "@/lib/utils";

// Robust image picker for the admin CMS. Wraps a real <input type="file">
// (so the file still posts through the multipart form naturally) and adds:
// drag-and-drop, a live preview, a client-side size/MIME guard that mirrors
// the bucket policy (instant feedback instead of an opaque server failure),
// and natural width/height capture written to hidden inputs so the public
// gallery can reserve space and avoid layout shift.

export interface DropzoneLabels {
  prompt: string;
  replacePrompt: string;
  current: string;
  browse: string;
  clear: string;
  tooLarge: string;
  wrongType: string;
  /** Shown while the picked photo is being downscaled + re-encoded. */
  optimizing?: string;
  /** Suffix after the savings percent, e.g. "smaller" → "97% smaller". */
  savedLabel?: string;
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches bucket policy.
const DEFAULT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

// When `optimize` is on, a picked image is downscaled to this longest edge
// and re-encoded to WebP in the browser before upload — so a 10 MB phone
// photo (incl. HEIC, which Safari decodes natively) becomes a few-hundred-KB
// WebP. next/image still re-optimizes at serve time; this just keeps the
// stored original lean and the format web-safe, and sidesteps the 1 MB
// server-action body limit.
const OPTIMIZE_MAX_EDGE = 2400;
const OPTIMIZE_QUALITY = 0.85;
// A picked file can be larger than the bucket cap when optimize is on, since
// we shrink it before upload. Cap the *input* generously to avoid OOM.
const OPTIMIZE_MAX_INPUT_BYTES = 40 * 1024 * 1024;

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Downscale a loaded image to a ~20px longest edge and return a base64
// JPEG data-URL — a few hundred bytes, enough for next/image's blurred
// placeholder. The source is a same-origin blob URL, so the canvas isn't
// tainted. Returns "" if the canvas API is unavailable.
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

export function ImageDropzone({
  name,
  label,
  hint,
  labels,
  currentImageUrl,
  required,
  error,
  maxBytes = DEFAULT_MAX_BYTES,
  allowedTypes = DEFAULT_TYPES,
  optimize = false,
}: {
  name: string;
  label: string;
  hint?: string;
  labels: DropzoneLabels;
  currentImageUrl?: string | null;
  required?: boolean;
  error?: string;
  maxBytes?: number;
  allowedTypes?: string[];
  /**
   * Client-side downscale + WebP re-encode before upload. Use for photo
   * galleries: accepts any image (incl. HEIC on Safari), submits a lean
   * WebP, and records the *output* dimensions. The target bucket must
   * allow image/webp.
   */
  optimize?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const [guardError, setGuardError] = useState<string | null>(null);
  // Optimize-mode feedback: the input byte size before re-encode, and a
  // flag while the canvas encodes — so the user sees the work and the
  // before→after payoff instead of a silent swap.
  const [optimizing, setOptimizing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [blurDataUrl, setBlurDataUrl] = useState("");

  // Revoke the object URL when it changes or the component unmounts so we
  // don't leak blob URLs across re-selections.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const reset = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMeta(null);
    setOptimizing(false);
    setOriginalSize(null);
    setWidth("");
    setHeight("");
    setBlurDataUrl("");
  }, []);

  const accept = useCallback(
    (file: File) => {
      setGuardError(null);
      // In optimize mode we re-encode to WebP, so accept any image the
      // browser can decode (incl. HEIC with an empty type on Safari);
      // decode failure is caught below. Otherwise enforce the strict list.
      const typeOk = optimize
        ? file.type === "" || file.type.startsWith("image/")
        : allowedTypes.includes(file.type);
      if (!typeOk) {
        setGuardError(labels.wrongType);
        reset();
        return;
      }
      if (file.size > (optimize ? OPTIMIZE_MAX_INPUT_BYTES : maxBytes)) {
        setGuardError(labels.tooLarge);
        reset();
        return;
      }
      setOriginalSize(file.size);
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      // Probe for dimensions + a tiny LQIP. In optimize mode we also
      // downscale to a WebP and swap it into the input so the form posts
      // the lean version with its real (output) dimensions.
      const probe = new window.Image();
      probe.onerror = () => {
        setGuardError(labels.wrongType);
        reset();
      };
      probe.onload = async () => {
        setBlurDataUrl(makeBlurDataUrl(probe));
        if (optimize) {
          setOptimizing(true);
          try {
            const result = await resizeToWebp(probe, file.name);
            if (result && inputRef.current) {
              const transfer = new DataTransfer();
              transfer.items.add(result.file);
              inputRef.current.files = transfer.files;
              setWidth(String(result.width));
              setHeight(String(result.height));
              setMeta({
                width: result.width,
                height: result.height,
                size: result.file.size,
              });
              return;
            }
          } finally {
            setOptimizing(false);
          }
        }
        setWidth(String(probe.naturalWidth));
        setHeight(String(probe.naturalHeight));
        setMeta({
          width: probe.naturalWidth,
          height: probe.naturalHeight,
          size: file.size,
        });
      };
      probe.src = url;
    },
    [allowedTypes, maxBytes, labels.wrongType, labels.tooLarge, reset, optimize],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) accept(file);
      else reset();
    },
    [accept, reset],
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (!file || !inputRef.current) return;
      // Push the dropped file into the real input so it submits with the
      // form exactly as a click-selected file would.
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
      accept(file);
    },
    [accept],
  );

  const shownImage = previewUrl ?? currentImageUrl ?? null;
  const showReplacePrompt = Boolean(currentImageUrl) && !previewUrl;
  // The shrink ratio, only when optimize actually made the file smaller.
  const savedPct =
    optimize && originalSize && meta && meta.size < originalSize
      ? Math.round((1 - meta.size / originalSize) * 100)
      : null;

  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>

      <div
        role="group"
        aria-label={label}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative grid cursor-pointer place-items-center gap-3 rounded-md border border-dashed border-border bg-background/60 p-4 text-center transition-colors",
          "hover:border-ring/60 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
          dragging && "border-ring bg-ring/5",
          error && "border-destructive",
        )}
      >
        {shownImage ? (
          <div className="relative aspect-4/5 w-full max-w-44 overflow-hidden rounded-md border border-border/60">
            <Image
              src={shownImage}
              alt=""
              fill
              sizes="176px"
              unoptimized={Boolean(previewUrl)}
              className="object-cover"
            />
            {optimizing ? (
              <div className="absolute inset-0 grid place-items-center bg-background/45 backdrop-blur-[1px]">
                <Loader2
                  aria-hidden="true"
                  className="size-5 animate-spin text-ring"
                />
              </div>
            ) : null}
            {previewUrl && !optimizing ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                aria-label={labels.clear}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : (
          <ImageUp
            aria-hidden="true"
            className="size-7 text-muted-foreground/70 transition-colors group-hover:text-ring"
          />
        )}

        <div className="grid justify-items-center gap-1" aria-live="polite">
          <span className="text-xs font-medium text-foreground">
            {showReplacePrompt ? labels.replacePrompt : labels.prompt}
          </span>
          {showReplacePrompt ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
              {labels.current}
            </span>
          ) : null}
          {optimizing ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ring">
              {labels.optimizing ?? "Optimizing…"}
            </span>
          ) : (
            <>
              {savedPct !== null ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-ring/30 bg-ring/10 px-2 py-0.5 font-mono text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ring">
                  <ArrowDown aria-hidden="true" className="size-3" />
                  {savedPct}% {labels.savedLabel ?? "smaller"}
                </span>
              ) : null}
              {meta ? (
                <span className="font-mono text-[0.6rem] text-muted-foreground/80">
                  {optimize && originalSize && savedPct !== null
                    ? `${formatBytes(originalSize)} → ${formatBytes(meta.size)} · WebP · `
                    : `${formatBytes(meta.size)} · `}
                  {meta.width}×{meta.height}
                </span>
              ) : null}
            </>
          )}
        </div>

        {/* Real focusable control so the picker is keyboard/AT-reachable;
            the surrounding div click is mouse-only convenience. */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className={cn(
            "rounded-md border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/70",
            FOCUS_RING,
          )}
        >
          {labels.browse}
        </button>

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={allowedTypes.join(",")}
          required={required && !currentImageUrl}
          onChange={onInputChange}
          className="sr-only"
          // Browser extensions decorate file inputs with their own attributes
          // before hydration — harmless, but it trips React's attribute check.
          suppressHydrationWarning
        />
      </div>

      {/* Client-captured natural dimensions, persisted server-side to kill
          layout shift on the public gallery. Empty on edit-without-replace. */}
      <input type="hidden" name="width" value={width} />
      <input type="hidden" name="height" value={height} />
      <input type="hidden" name="blurDataUrl" value={blurDataUrl} />

      {guardError ? (
        <span className="text-[0.7rem] text-destructive">{guardError}</span>
      ) : error ? (
        <span className="text-[0.7rem] text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>
      ) : null}
    </div>
  );
}
