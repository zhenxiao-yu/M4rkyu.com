"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  FolderUp,
  ImageUp,
  Loader2,
  RotateCw,
  UploadCloud,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { optimizeImageFile, readCapturedAt } from "@/lib/gallery/client-image";
import { slugify } from "@/components/admin/slug-field";
import { createGalleryItemsBatchAction } from "@/lib/gallery/admin";
import { ADMIN_ACTION_IDLE } from "@/lib/admin/action-state";
import { cn } from "@/lib/utils";

interface Staged {
  id: string;
  title: string;
  slug: string;
  previewUrl: string;
  status: "preparing" | "ready" | "uploading" | "done" | "error";
  /** Original file, retained so a failed optimize can be retried. */
  sourceFile: File;
  /** Optimized WebP — set once `preparing` resolves. */
  file: File | null;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  capturedAt?: string;
}

interface BatchPayloadItem {
  path: string;
  slug: string;
  title: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  aspect: string;
  capturedAt?: string;
}

const ASPECTS: [string, number][] = [
  ["1/1", 1],
  ["4/5", 0.8],
  ["3/4", 0.75],
  ["2/3", 0.6667],
  ["16/9", 1.7778],
  ["21/9", 2.3333],
];

function nearestAspect(w?: number, h?: number): string {
  if (!w || !h) return "4/5";
  const r = w / h;
  let best = "4/5";
  let bestDelta = Infinity;
  for (const [a, val] of ASPECTS) {
    const d = Math.abs(val - r);
    if (d < bestDelta) {
      bestDelta = d;
      best = a;
    }
  }
  return best;
}

function rid() {
  return Math.random().toString(36).slice(2, 10);
}

// Folder drops carry junk (.DS_Store, Thumbs.db, sidecars) with no MIME type,
// so empty-type files are gated on an image extension; real image/* always pass.
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|bmp|tiff?|heic|heif)$/i;
function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (file.type === "") return IMAGE_EXT.test(file.name);
  return false;
}

// Run an async worker over a list with a fixed concurrency — keeps a 200-photo
// folder from opening 200 simultaneous Storage uploads (which starves the tab
// and makes progress unreadable). Preserves order of dispatch, not completion.
async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const lanes = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        await worker(items[index]);
      }
    },
  );
  await Promise.all(lanes);
}

// Recursively flatten a dropped DataTransfer entry (file or directory tree)
// into image files. `webkitGetAsEntry()` must be read synchronously in the
// drop handler (the entries are only valid during the event); the walk itself
// is async and runs after.
async function collectEntry(entry: FileSystemEntry, out: File[]): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File | null>((resolve) =>
      (entry as FileSystemFileEntry).file(resolve, () => resolve(null)),
    );
    if (file && isImageFile(file)) out.push(file);
    return;
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    // readEntries yields in chunks; call until it returns empty.
    const readChunk = () =>
      new Promise<FileSystemEntry[]>((resolve) =>
        reader.readEntries(resolve, () => resolve([])),
      );
    let chunk = await readChunk();
    while (chunk.length) {
      for (const child of chunk) await collectEntry(child, out);
      chunk = await readChunk();
    }
  }
}

const UPLOAD_CONCURRENCY = 4;

/**
 * Batch uploader for the gallery item manager. Drop a folder (or pick one /
 * pick files) from the PC; each image is optimized to a lean WebP in the
 * browser (dimensions + LQIP + EXIF date captured), uploaded straight to
 * Supabase Storage through the authenticated browser client — which sidesteps
 * the server-action body limit — then the resulting paths + metadata are
 * inserted as draft items in one action call.
 *
 * Robustness for big folders: a concurrency-limited upload queue with an
 * aggregate progress bar, per-tile status, and a retry pass for failures
 * (re-optimize on optimize failure, re-upload on upload failure). Successful
 * items clear after insert; failures stay staged so retry is one click.
 */
export function BatchUploadDropzone({
  collectionId,
  collectionSlug,
}: {
  collectionId: string;
  collectionSlug: string;
}) {
  const t = useTranslations("AdminGallery");
  const filesInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const stagedRef = useRef<Staged[]>([]);
  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  // Mirror staged into a ref so slug de-duplication + retry read the latest set
  // without putting side effects (createObjectURL, optimize) inside a state
  // updater — those must stay pure (React calls them twice in dev).
  useEffect(() => {
    stagedRef.current = staged;
  }, [staged]);

  // The folder picker needs the non-standard `webkitdirectory` attribute, which
  // React has no typed prop for — set it imperatively once mounted.
  useEffect(() => {
    const el = folderInputRef.current;
    if (el) {
      el.setAttribute("webkitdirectory", "");
      el.setAttribute("directory", "");
    }
  }, []);

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      stagedRef.current.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
  }, []);

  const dedupe = useCallback((base: string, used: Set<string>) => {
    let slug = base || "photo";
    for (let n = 2; used.has(slug) && n < 999; n += 1) slug = `${base}-${n}`;
    used.add(slug);
    return slug;
  }, []);

  // Optimize + read EXIF for one staged entry, patching it to ready/error.
  const prepare = useCallback((entry: Staged) => {
    void Promise.all([
      optimizeImageFile(entry.sourceFile),
      readCapturedAt(entry.sourceFile),
    ]).then(([opt, capturedAt]) => {
      setStaged((cur) =>
        cur.map((s) =>
          s.id === entry.id
            ? opt
              ? {
                  ...s,
                  status: "ready",
                  file: opt.file,
                  width: opt.width,
                  height: opt.height,
                  blurDataUrl: opt.blurDataUrl,
                  capturedAt: capturedAt ?? undefined,
                }
              : { ...s, status: "error", file: null }
            : s,
        ),
      );
    });
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter(isImageFile);
      if (images.length === 0) return;
      const used = new Set(stagedRef.current.map((s) => s.slug));
      const additions: Staged[] = images.map((file) => {
        const name = file.name.replace(/\.[^.]+$/, "");
        return {
          id: rid(),
          title: name.trim() || "Untitled",
          slug: dedupe(slugify(name) || "photo", used),
          previewUrl: URL.createObjectURL(file),
          status: "preparing",
          sourceFile: file,
          file: null,
        };
      });
      additions.forEach(prepare);
      setStaged((prev) => [...prev, ...additions]);
    },
    [dedupe, prepare],
  );

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dt = event.dataTransfer;
    // Grab folder entries synchronously (valid only during the event); fall
    // back to a flat file list where the entries API is absent.
    const entries = (dt.items ? Array.from(dt.items) : [])
      .map((item) =>
        typeof item.webkitGetAsEntry === "function"
          ? item.webkitGetAsEntry()
          : null,
      )
      .filter((e): e is FileSystemEntry => Boolean(e));
    const fallback = Array.from(dt.files);
    if (entries.length === 0) {
      addFiles(fallback);
      return;
    }
    void (async () => {
      const out: File[] = [];
      for (const entry of entries) await collectEntry(entry, out);
      addFiles(out.length ? out : fallback);
    })();
  }

  function removeStaged(id: string) {
    setStaged((prev) => {
      const target = prev.find((s) => s.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  }

  function clearAll() {
    setStaged((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      return [];
    });
  }

  function retryFailed() {
    const failed = stagedRef.current.filter((s) => s.status === "error");
    if (failed.length === 0) return;
    setStaged((cur) =>
      cur.map((s) =>
        s.status === "error"
          ? s.file
            ? { ...s, status: "ready" } // upload failed → re-upload
            : { ...s, status: "preparing" } // optimize failed → re-optimize
          : s,
      ),
    );
    failed.filter((s) => !s.file).forEach(prepare);
  }

  const readyCount = staged.filter((s) => s.status === "ready").length;
  const failedCount = staged.filter((s) => s.status === "error").length;
  const preparing = staged.some((s) => s.status === "preparing");

  async function uploadAll() {
    const items = staged.filter((s) => s.status === "ready" && s.file);
    if (items.length === 0 || busy) return;
    setBusy(true);
    setProgress({ done: 0, total: items.length });
    try {
      const supabase = createSupabaseBrowserClient();
      const ok: BatchPayloadItem[] = [];

      await runPool(items, UPLOAD_CONCURRENCY, async (item) => {
        if (!item.file) return;
        setStaged((cur) =>
          cur.map((s) =>
            s.id === item.id ? { ...s, status: "uploading" } : s,
          ),
        );
        const path = `${collectionSlug}/${item.slug}-${rid()}.webp`;
        const { error } = await supabase.storage
          .from("gallery-images")
          .upload(path, item.file, { contentType: "image/webp", upsert: false });
        setStaged((cur) =>
          cur.map((s) =>
            s.id === item.id ? { ...s, status: error ? "error" : "done" } : s,
          ),
        );
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
        if (!error) {
          ok.push({
            path,
            slug: item.slug,
            title: item.title,
            width: item.width,
            height: item.height,
            blurDataUrl: item.blurDataUrl,
            aspect: nearestAspect(item.width, item.height),
            capturedAt: item.capturedAt,
          });
        }
      });

      if (ok.length === 0) {
        toast.error(t("batch.failed"));
        return;
      }
      if (ok.length < items.length) toast.error(t("batch.failed"));

      const fd = new FormData();
      fd.set("collectionId", collectionId);
      fd.set("items", JSON.stringify(ok));
      const res = await createGalleryItemsBatchAction(ADMIN_ACTION_IDLE, fd);
      if (res.status === "success") {
        toast.success(t("batch.done", { count: ok.length }));
        // Drop the inserted (done) tiles; keep failures staged for retry.
        setStaged((cur) => {
          cur.forEach((s) => {
            if (s.status === "done") URL.revokeObjectURL(s.previewUrl);
          });
          return cur.filter((s) => s.status !== "done");
        });
      } else {
        // The action cleans up the storage objects it couldn't insert, so the
        // uploaded tiles are reset to ready for a clean re-upload + re-insert.
        setStaged((cur) =>
          cur.map((s) => (s.status === "done" ? { ...s, status: "ready" } : s)),
        );
        toast.error(res.message ?? t("batch.failed"));
      }
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <div className="grid gap-3">
      {/* Drop target — keyboard users pick via the buttons below; the area is
        * a pointer/drag affordance. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "grid place-items-center gap-3 rounded-lg border border-dashed bg-background/60 px-6 py-8 text-center transition-colors",
          dragging ? "border-ring bg-ring/5" : "border-border",
        )}
      >
        <ImageUp
          aria-hidden="true"
          className={cn(
            "size-7 transition-colors",
            dragging ? "text-ring" : "text-muted-foreground/70",
          )}
        />
        <div className="grid gap-1">
          <span className="text-sm font-medium text-foreground">
            {t("batch.prompt")}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
            {t("batch.hint")}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => filesInputRef.current?.click()}
          >
            <ImageUp className="size-3.5" aria-hidden="true" />
            {t("batch.browse")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => folderInputRef.current?.click()}
          >
            <FolderUp className="size-3.5" aria-hidden="true" />
            {t("batch.browseFolder")}
          </Button>
        </div>
        <input
          ref={filesInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          // Browser extensions decorate file inputs before hydration — harmless,
          // but it trips React's attribute-match check. Suppress for this node.
          suppressHydrationWarning
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          suppressHydrationWarning
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {staged.length > 0 ? (
        <>
          {/* Aggregate upload progress. */}
          {progress ? (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
                <span>{t("batch.uploading")}</span>
                <span className="tabular-nums">
                  {t("batch.progress", {
                    done: progress.done,
                    total: progress.total,
                  })}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress.done}
                aria-valuemin={0}
                aria-valuemax={progress.total}
                className="h-1 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-ring transition-[width] duration-(--motion-fast) ease-(--ease-premium)"
                  style={{
                    width: `${(progress.done / Math.max(1, progress.total)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {/* Staged tiles. */}
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {staged.map((s) => (
              <li key={s.id} className="relative">
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border bg-muted/30",
                    s.status === "error" ? "border-destructive" : "border-border/60",
                  )}
                >
                  <Image
                    src={s.previewUrl}
                    alt=""
                    fill
                    sizes="120px"
                    unoptimized
                    className={cn(
                      "object-cover transition-opacity",
                      s.status === "done" && "opacity-50",
                    )}
                  />
                  {(s.status === "preparing" || s.status === "uploading") && (
                    <div className="absolute inset-0 grid place-items-center bg-background/50 backdrop-blur-[1px]">
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin text-ring"
                      />
                    </div>
                  )}
                  {s.status === "done" && (
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="grid size-6 place-items-center rounded-full bg-ring text-background shadow-sm">
                        <Check aria-hidden="true" className="size-3.5" />
                      </span>
                    </div>
                  )}
                  {s.status === "error" && (
                    <div className="absolute inset-x-0 bottom-0 bg-destructive/90 py-0.5 text-center font-mono text-[0.5rem] uppercase tracking-[0.14em] text-destructive-foreground">
                      {t("batch.failedBadge")}
                    </div>
                  )}
                  {!busy ? (
                    <button
                      type="button"
                      onClick={() => removeStaged(s.id)}
                      aria-label={t("batch.remove")}
                      className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-background"
                    >
                      <X aria-hidden="true" className="size-3" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-[0.65rem] text-muted-foreground">
                  {s.title}
                </p>
              </li>
            ))}
          </ul>

          {/* Actions. */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy || preparing || readyCount === 0}
              onClick={uploadAll}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="size-4" aria-hidden="true" />
              )}
              {busy
                ? t("batch.uploading")
                : preparing
                  ? t("batch.preparing")
                  : t("batch.add", { count: readyCount })}
            </Button>
            {failedCount > 0 && !busy ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={retryFailed}
              >
                <RotateCw className="size-3.5" aria-hidden="true" />
                {t("batch.retry", { count: failedCount })}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={clearAll}
            >
              <X className="size-3.5" aria-hidden="true" />
              {t("batch.clear")}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
