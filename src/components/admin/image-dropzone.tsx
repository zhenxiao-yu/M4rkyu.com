"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB — matches bucket policy.
const DEFAULT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

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
    setWidth("");
    setHeight("");
    setBlurDataUrl("");
  }, []);

  const accept = useCallback(
    (file: File) => {
      setGuardError(null);
      if (!allowedTypes.includes(file.type)) {
        setGuardError(labels.wrongType);
        reset();
        return;
      }
      if (file.size > maxBytes) {
        setGuardError(labels.tooLarge);
        reset();
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      // Read natural dimensions + a tiny blur placeholder so the server
      // can persist width/height and an LQIP (no server-side sharp).
      const probe = new window.Image();
      probe.onload = () => {
        setWidth(String(probe.naturalWidth));
        setHeight(String(probe.naturalHeight));
        setMeta({
          width: probe.naturalWidth,
          height: probe.naturalHeight,
          size: file.size,
        });
        setBlurDataUrl(makeBlurDataUrl(probe));
      };
      probe.src = url;
    },
    [allowedTypes, maxBytes, labels.wrongType, labels.tooLarge, reset],
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

  return (
    <div className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>

      <div
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
            {previewUrl ? (
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

        <div className="grid gap-0.5">
          <span className="text-xs font-medium text-foreground">
            {showReplacePrompt ? labels.replacePrompt : labels.prompt}
          </span>
          {showReplacePrompt ? (
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
              {labels.current}
            </span>
          ) : null}
          {meta ? (
            <span className="font-mono text-[0.6rem] text-muted-foreground/80">
              {meta.width}×{meta.height}px · {formatBytes(meta.size)}
            </span>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={allowedTypes.join(",")}
          required={required && !currentImageUrl}
          onChange={onInputChange}
          className="sr-only"
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
