"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Loader2, Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  DEFAULT_MAX_IMAGE_BYTES,
  formatBytes,
  validateFile,
} from "@/components/tools/_shared/file-input";
import { quantizePalette, type PaletteSwatch } from "@/lib/tools/color-palette";

const MAX_DIM = 100; // downscale longest edge before sampling pixels
const MIN_COUNT = 2;
const MAX_COUNT = 12;

export function ColorPalette() {
  const t = useTranslations("Tools.colorPalette");
  const tc = useTranslations("Tools.common");

  const [swatches, setSwatches] = useState<PaletteSwatch[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const lastFileRef = useRef<File | null>(null);

  function revokePreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  // Release the object URL when the tool unmounts.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  async function handleFile(file: File | undefined | null, nextCount = count) {
    if (!file) return;

    // UPLOAD SAFETY: validate size + MIME *before* decoding so a huge or
    // non-image drop can't hang the tab.
    const reason = validateFile(file, {
      accept: ["image/"],
      maxBytes: DEFAULT_MAX_IMAGE_BYTES,
    });
    if (reason === "too-large") {
      setError(tc("tooLarge", { max: formatBytes(DEFAULT_MAX_IMAGE_BYTES) }));
      return;
    }
    if (reason === "wrong-type") {
      setError(tc("wrongType"));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(bitmap, 0, 0, w, h);
      bitmap.close?.();
      const pixels = ctx.getImageData(0, 0, w, h).data;
      const result = quantizePalette(pixels, nextCount);

      // Reuse the preview URL when re-sampling the same file (count change),
      // otherwise revoke the old one and make a fresh object URL.
      if (file !== lastFileRef.current) {
        revokePreview();
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPreview(url);
      }
      lastFileRef.current = file;
      setSwatches(result);
    } catch {
      setError(tc("readFailed"));
    } finally {
      setBusy(false);
    }
  }

  function setCountAndResample(next: number) {
    const clamped = Math.max(MIN_COUNT, Math.min(MAX_COUNT, next));
    setCount(clamped);
    // Re-quantize the original file for accurate buckets (works for both
    // file-input and drag-drop, since we keep the last File in a ref).
    const file = lastFileRef.current;
    if (file) void handleFile(file, clamped);
  }

  function reset() {
    revokePreview();
    lastFileRef.current = null;
    setPreview(null);
    setSwatches([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const allHex = swatches.map((s) => s.hex).join("\n");

  return (
    <div className="grid min-w-0 gap-4">
      {/* Controls */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span
            id="color-count-label"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("countLabel")}
          </span>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="size-9 px-0"
              onClick={() => setCountAndResample(count - 1)}
              disabled={busy || count <= MIN_COUNT}
              aria-label={t("decrease")}
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </Button>
            <input
              type="number"
              inputMode="numeric"
              min={MIN_COUNT}
              max={MAX_COUNT}
              value={count}
              aria-labelledby="color-count-label"
              onChange={(e) =>
                setCountAndResample(Number(e.target.value) || MIN_COUNT)
              }
              className={cn(
                "h-9 w-14 rounded-md border border-border bg-background px-2 text-center font-mono text-sm tabular-nums",
                FOCUS_RING_INSET,
              )}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="size-9 px-0"
              onClick={() => setCountAndResample(count + 1)}
              disabled={busy || count >= MAX_COUNT}
              aria-label={t("increase")}
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {preview ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={reset}
            className="min-h-9"
          >
            <X className="size-3.5" aria-hidden="true" /> {tc("clear")}
          </Button>
        ) : null}

        <CopyButton
          value={allHex}
          label={t("hexLabel")}
          disabled={swatches.length === 0}
          className="ml-auto min-h-9"
        >
          {tc("copyAll")}
        </CopyButton>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-[0.7rem] text-destructive"
        >
          {error}
        </p>
      ) : null}

      {preview ? (
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          <div className="relative min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL, no optimization applicable */}
            <img
              src={preview}
              alt={t("previewAlt")}
              className="max-h-72 w-full rounded-md border border-border bg-card/40 object-contain"
            />
            {busy ? (
              <div className="absolute inset-0 grid place-items-center rounded-md bg-background/60">
                <Loader2
                  className="size-5 motion-safe:animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="sr-only">{t("extracting")}</span>
              </div>
            ) : null}
          </div>

          <ul className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {swatches.map((s) => (
              <li
                key={s.hex}
                className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-card/40 p-2"
              >
                <span
                  className="size-9 shrink-0 rounded-md border border-border/60"
                  style={{ background: s.hex }}
                  aria-hidden="true"
                />
                <code className="font-mono text-sm uppercase">{s.hex}</code>
                <span className="ml-auto truncate font-mono text-[0.65rem] text-muted-foreground">
                  {t("pixels", { count: s.count })}
                </span>
                <CopyButton value={s.hex} label={s.hex} className="shrink-0" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Dropzone
          dragging={dragging}
          busy={busy}
          onActivate={() => fileInputRef.current?.click()}
          onDragState={setDragging}
          onDrop={(file) => void handleFile(file)}
          prompt={dragging ? t("dropPrompt") : tc("empty")}
          hint={tc("emptyHint")}
          choose={t("chooseImage")}
          formats={t("formats")}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label={t("chooseImage")}
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function Dropzone({
  dragging,
  busy,
  onActivate,
  onDragState,
  onDrop,
  prompt,
  hint,
  choose,
  formats,
}: {
  dragging: boolean;
  busy: boolean;
  onActivate: () => void;
  onDragState: (v: boolean) => void;
  onDrop: (file: File | undefined) => void;
  prompt: string;
  hint: string;
  choose: string;
  formats: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={choose}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragState(true);
      }}
      onDragLeave={() => onDragState(false)}
      onDrop={(e) => {
        e.preventDefault();
        onDragState(false);
        onDrop(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "grid min-h-44 cursor-pointer place-items-center gap-2 rounded-lg border border-dashed bg-card/40 p-6 text-center",
        "motion-safe:transition-colors motion-safe:duration-(--motion-fast)",
        dragging
          ? "border-ring bg-ring/5"
          : "border-border hover:border-foreground/40",
        FOCUS_RING,
      )}
    >
      {busy ? (
        <Loader2
          className="size-6 motion-safe:animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="font-mono text-sm text-foreground">{prompt}</span>
      <span className="max-w-prose font-mono text-[0.7rem] text-muted-foreground">
        {hint}
      </span>
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/70">
        {formats}
      </span>
      <Button type="button" size="sm" variant="outline" className="mt-1 min-h-9" tabIndex={-1}>
        <ImageUp className="size-3.5" aria-hidden="true" /> {choose}
      </Button>
    </div>
  );
}
