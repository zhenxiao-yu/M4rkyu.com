"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { galleryAspectSchema } from "@/content/schemas";
import {
  type CropHandle,
  type Rect,
  clampRect,
  cropFileToAspect,
  fitRect,
  moveRect,
  parseAspectRatio,
  resizeRect,
} from "@/lib/gallery/crop";
import { cn } from "@/lib/utils";

type AspectChoice = "free" | (typeof galleryAspectSchema.options)[number];
const ASPECT_CHOICES: AspectChoice[] = ["free", ...galleryAspectSchema.options];

// The 8 resize handles + their position within the crop rect. Each renders a
// 44px transparent hit pad with a small visible mark; only the 4 corners show
// on a coarse pointer to keep the box readable on a phone.
const HANDLES: { id: CropHandle; cls: string; corner: boolean }[] = [
  { id: "nw", cls: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize", corner: true },
  { id: "ne", cls: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize", corner: true },
  { id: "sw", cls: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize", corner: true },
  { id: "se", cls: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize", corner: true },
  { id: "n", cls: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize", corner: false },
  { id: "s", cls: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize", corner: false },
  { id: "w", cls: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize", corner: false },
  { id: "e", cls: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize", corner: false },
];

interface Display {
  w: number;
  h: number;
  offX: number;
  offY: number;
}

function computeDisplay(natW: number, natH: number, vpW: number, vpH: number): Display {
  const scale = Math.min(vpW / natW, vpH / natH) || 1;
  const w = natW * scale;
  const h = natH * scale;
  return { w, h, offX: (vpW - w) / 2, offY: (vpH - h) / 2 };
}

interface ImageCropperProps {
  /** The picked source file (original, pre-optimize). */
  file: File;
  /** Initial aspect lock (a gallery ratio like "4/5" or "free"); coerced. */
  aspect?: string;
  open: boolean;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
}

function coerceAspect(value: string): AspectChoice {
  return (ASPECT_CHOICES as string[]).includes(value)
    ? (value as AspectChoice)
    : "free";
}

/**
 * Dependency-free image cropper. Decodes the picked file once (the browser
 * auto-orients on `<img>` decode, so the canvas crop is already upright — no
 * manual EXIF rotation). A draggable + resizable crop box, driven entirely by
 * Pointer Events so mouse and touch share one path, with aspect-lock chips
 * matching the gallery frame ratios. Confirm draws the crop region to a canvas
 * and returns a `File` that feeds the existing optimize pipeline. On a coarse
 * pointer the dialog becomes a bottom sheet and only the corner handles show.
 */
export function ImageCropper({
  file,
  aspect = "free",
  open,
  onConfirm,
  onCancel,
}: ImageCropperProps) {
  const t = useTranslations("AdminGallery");
  const titleId = useId();
  const coarse = useMediaQuery("(pointer: coarse)");

  const decodedRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const displayRef = useRef<Display | null>(null);
  const rectRef = useRef<Rect | null>(null);
  const rafRef = useRef<number | null>(null);
  const drag = useRef<{
    mode: "move" | CropHandle;
    startX: number;
    startY: number;
    startRect: Rect;
  } | null>(null);

  const [ready, setReady] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [choice, setChoice] = useState<AspectChoice>(() => coerceAspect(aspect));
  const [display, setDisplay] = useState<Display | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  // Decode the file once; revoke on unmount. onerror → cancel (graceful skip,
  // e.g. HEIC the browser can't decode) so the upload falls back to no-crop.
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    const img = new window.Image();
    img.onload = () => {
      decodedRef.current = img;
      setReady(true);
    };
    img.onerror = () => onCancel();
    img.src = objectUrl;
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
      setReady(false);
    };
  }, [file, onCancel]);

  // (Re)fit the displayed image + crop rect to the viewport. Scales an existing
  // rect proportionally on resize so the user's crop survives a reflow.
  useEffect(() => {
    if (!ready) return;
    const img = decodedRef.current;
    const vp = viewportRef.current;
    if (!img || !vp) return;

    const recompute = () => {
      const next = computeDisplay(
        img.naturalWidth,
        img.naturalHeight,
        vp.clientWidth,
        vp.clientHeight,
      );
      const prev = displayRef.current;
      displayRef.current = next;
      setDisplay(next);
      setRect((cur) => {
        if (!cur || !prev || prev.w === 0) {
          const fitted = fitRect(next.w, next.h, parseAspectRatio(choice));
          rectRef.current = fitted;
          return fitted;
        }
        const k = next.w / prev.w;
        const scaled = clampRect(
          { x: cur.x * k, y: cur.y * k, w: cur.w * k, h: cur.h * k },
          { w: next.w, h: next.h },
        );
        rectRef.current = scaled;
        return scaled;
      });
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(vp);
    return () => ro.disconnect();
    // choice intentionally omitted — aspect changes are handled in selectAspect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  function commit(next: Rect) {
    rectRef.current = next;
    setRect(next);
  }

  function selectAspect(value: AspectChoice) {
    setChoice(value);
    const d = displayRef.current;
    if (d) commit(fitRect(d.w, d.h, parseAspectRatio(value)));
  }

  function handlePointerDown(e: React.PointerEvent) {
    const mode = (e.currentTarget as HTMLElement).dataset.cropMode as
      | "move"
      | CropHandle
      | undefined;
    const startRect = rectRef.current;
    if (!mode || !startRect) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      startRect,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const disp = displayRef.current;
    if (!d || !disp) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const bounds = { w: disp.w, h: disp.h };
    const ratio = parseAspectRatio(choice);
    const next =
      d.mode === "move"
        ? moveRect(d.startRect, dx, dy, bounds)
        : resizeRect(d.startRect, d.mode, dx, dy, ratio, bounds);
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      commit(next);
    });
  }

  function endDrag(e: React.PointerEvent) {
    if (!drag.current) return;
    drag.current = null;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  }

  async function confirm() {
    const img = decodedRef.current;
    const d = displayRef.current;
    const r = rectRef.current;
    if (!img || !d || !r) return;
    const scale = img.naturalWidth / d.w || 1;
    const source: Rect = {
      x: r.x * scale,
      y: r.y * scale,
      w: r.w * scale,
      h: r.h * scale,
    };
    const cropped = await cropFileToAspect(file, source, img);
    onConfirm(cropped);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : onCancel())}>
      <DialogContent
        aria-labelledby={titleId}
        hideCloseButton
        className={cn(
          "max-w-2xl gap-3 p-4",
          coarse &&
            "inset-x-0 bottom-0 left-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-b-none",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <DialogTitle id={titleId} className="text-base">
            {t("crop.title")}
          </DialogTitle>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("crop.cancel")}
            className="grid size-11 place-items-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        {/* Stage — the image + crop overlay. touch-action:none so a drag never
          * pans the page mid-crop. */}
        <div
          ref={viewportRef}
          className="relative w-full touch-none overflow-hidden rounded-md bg-muted/40"
          style={{ height: coarse ? "55vh" : "min(60vh, 30rem)" }}
        >
          {ready && display ? (
            // Raw <img>: a manually-sized, same-origin blob URL that next/image
            // can't optimize (and shouldn't — it's the in-memory crop source).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="pointer-events-none absolute select-none"
              src={url ?? undefined}
              style={{
                left: display.offX,
                top: display.offY,
                width: display.w,
                height: display.h,
              }}
              draggable={false}
            />
          ) : (
            <div className="grid size-full place-items-center text-sm text-muted-foreground">
              {t("crop.loading")}
            </div>
          )}

          {display && rect ? (
            <>
              {/* Four dim panels around the crop rect. */}
              {(() => {
                const l = display.offX + rect.x;
                const top = display.offY + rect.y;
                const r = l + rect.w;
                const b = top + rect.h;
                const panel = "absolute bg-background/65";
                return (
                  <>
                    <div className={panel} style={{ left: 0, top: 0, right: 0, height: top }} />
                    <div className={panel} style={{ left: 0, top: b, right: 0, bottom: 0 }} />
                    <div className={panel} style={{ left: 0, top, width: l, height: rect.h }} />
                    <div className={panel} style={{ left: r, top, right: 0, height: rect.h }} />
                  </>
                );
              })()}

              {/* The crop rect — drag body to move; handles to resize. */}
              <div
                className="absolute border border-ring shadow-[0_0_0_1px_color-mix(in_srgb,var(--background)_60%,transparent)]"
                style={{
                  left: display.offX + rect.x,
                  top: display.offY + rect.y,
                  width: rect.w,
                  height: rect.h,
                  touchAction: "none",
                }}
                data-crop-mode="move"
                onPointerDown={handlePointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                {/* Rule-of-thirds guides. */}
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-ring/30" />
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-ring/30" />
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-ring/30" />
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-ring/30" />

                {HANDLES.filter((hndl) => !coarse || hndl.corner).map((hndl) => (
                  <span
                    key={hndl.id}
                    data-crop-mode={hndl.id}
                    onPointerDown={handlePointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    className={cn(
                      "absolute grid size-11 place-items-center touch-none",
                      hndl.cls,
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-3 rounded-[2px] border border-background bg-ring shadow-sm"
                    />
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Aspect chips. */}
        <div className="flex flex-wrap gap-1.5">
          {ASPECT_CHOICES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={choice === value}
              onClick={() => selectAspect(value)}
              className={cn(
                "inline-flex min-h-9 items-center rounded-md border px-3 font-mono text-xs uppercase tracking-[0.1em] transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                coarse && "min-h-11 px-4",
                choice === value
                  ? "border-ring bg-ring/10 text-ring"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {value === "free" ? t("crop.free") : value.replace("/", ":")}
            </button>
          ))}
        </div>

        {/* Actions. */}
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("crop.cancel")}
          </Button>
          <Button type="button" onClick={confirm} disabled={!ready || !rect}>
            <Check className="size-4" aria-hidden="true" />
            {t("crop.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
