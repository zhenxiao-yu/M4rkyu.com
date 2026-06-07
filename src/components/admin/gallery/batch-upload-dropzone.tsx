"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Loader2, UploadCloud, X } from "lucide-react";
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
  file: File | null;
  width?: number;
  height?: number;
  blurDataUrl?: string;
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

/**
 * Drag-a-folder batch uploader. Each picked image is optimized to a lean WebP
 * in the browser (dimensions + LQIP captured), uploaded straight to Supabase
 * Storage via the authenticated browser client — which sidesteps the
 * server-action body limit — then the resulting paths + metadata are inserted
 * as draft items in one action call.
 */
export function BatchUploadDropzone({
  collectionId,
  collectionSlug,
}: {
  collectionId: string;
  collectionSlug: string;
}) {
  const t = useTranslations("AdminGallery");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [busy, setBusy] = useState(false);

  // Take the slugs currently staged so a batch never collides with itself;
  // the server de-collides against existing items too.
  const dedupe = useCallback((base: string, used: Set<string>) => {
    let slug = base || "photo";
    for (let n = 2; used.has(slug) && n < 500; n += 1) slug = `${base}-${n}`;
    used.add(slug);
    return slug;
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/") || f.type === "");
      if (images.length === 0) return;

      setStaged((prev) => {
        const used = new Set(prev.map((s) => s.slug));
        const additions: Staged[] = images.map((file) => {
          const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "photo";
          const slug = dedupe(base, used);
          const id = rid();
          // Kick off optimization + EXIF read in parallel (EXIF must come
          // from the original, pre-WebP file); patch the entry when ready.
          void Promise.all([
            optimizeImageFile(file),
            readCapturedAt(file),
          ]).then(([opt, capturedAt]) => {
            setStaged((cur) =>
              cur.map((s) =>
                s.id === id
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
                    : { ...s, status: "error" }
                  : s,
              ),
            );
          });
          return {
            id,
            title: file.name.replace(/\.[^.]+$/, "").trim() || "Untitled",
            slug,
            previewUrl: URL.createObjectURL(file),
            status: "preparing" as const,
            file: null,
          };
        });
        return [...prev, ...additions];
      });
    },
    [dedupe],
  );

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

  // Revoke any lingering object URLs on unmount.
  useEffect(() => {
    return () => {
      setStaged((prev) => {
        prev.forEach((s) => URL.revokeObjectURL(s.previewUrl));
        return prev;
      });
    };
  }, []);

  const readyCount = staged.filter((s) => s.status === "ready").length;
  const preparing = staged.some((s) => s.status === "preparing");

  async function uploadAll() {
    const items = staged.filter((s) => s.status === "ready" && s.file);
    if (items.length === 0 || busy) return;
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const results = await Promise.all(
        items.map(async (item) => {
          if (!item.file) return null;
          setStaged((cur) =>
            cur.map((s) =>
              s.id === item.id ? { ...s, status: "uploading" } : s,
            ),
          );
          const path = `${collectionSlug}/${item.slug}-${rid()}.webp`;
          const { error } = await supabase.storage
            .from("gallery-images")
            .upload(path, item.file, {
              contentType: "image/webp",
              upsert: false,
            });
          setStaged((cur) =>
            cur.map((s) =>
              s.id === item.id
                ? { ...s, status: error ? "error" : "done" }
                : s,
            ),
          );
          if (error) return null;
          return {
            path,
            slug: item.slug,
            title: item.title,
            width: item.width,
            height: item.height,
            blurDataUrl: item.blurDataUrl,
            aspect: nearestAspect(item.width, item.height),
            capturedAt: item.capturedAt,
          };
        }),
      );

      const ok = results.filter((r): r is NonNullable<typeof r> => r !== null);
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
        clearAll();
      } else {
        toast.error(res.message ?? t("batch.failed"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      {/* Dropzone */}
      <div
        role="group"
        aria-label={t("batch.heading")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group grid cursor-pointer place-items-center gap-2 rounded-lg border border-dashed border-border bg-background/60 p-6 text-center transition-colors hover:border-ring/60",
          dragging && "border-ring bg-ring/5",
        )}
      >
        <ImageUp
          aria-hidden="true"
          className="size-7 text-muted-foreground/70 transition-colors group-hover:text-ring"
        />
        <span className="text-sm font-medium text-foreground">
          {t("batch.prompt")}
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
          {t("batch.hint")}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          // Browser extensions (password managers, clippers) decorate file
          // inputs with their own attributes before hydration — harmless, but
          // it trips React's attribute-match check. Suppress for this node.
          suppressHydrationWarning
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {/* Staged grid */}
      {staged.length > 0 ? (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {staged.map((s) => (
              <li key={s.id} className="relative">
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted/30",
                    s.status === "error" && "border-destructive",
                  )}
                >
                  <Image
                    src={s.previewUrl}
                    alt=""
                    fill
                    sizes="120px"
                    unoptimized
                    className="object-cover"
                  />
                  {(s.status === "preparing" ||
                    s.status === "uploading") && (
                    <div className="absolute inset-0 grid place-items-center bg-background/50 backdrop-blur-[1px]">
                      <Loader2
                        aria-hidden="true"
                        className="size-4 animate-spin text-ring"
                      />
                    </div>
                  )}
                  {s.status === "done" && (
                    <div className="absolute inset-0 bg-ring/15" />
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

          <div className="flex items-center gap-2">
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
