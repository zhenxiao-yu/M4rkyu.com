"use client";

import { useId, useRef, useState } from "react";
import { ImageUp, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  DEFAULT_MAX_IMAGE_BYTES,
  formatBytes,
  readImageFile,
  type FileRejectReason,
} from "@/components/tools/_shared/file-input";
import { buildSnippets } from "@/lib/tools/image-to-data-uri";
import { cn, FOCUS_RING } from "@/lib/utils";

// Past ~1 MB encoded, an inlined data URI bloats CSS/HTML enough to be the
// wrong tool for the job. Files this size are still allowed (the hard cap is
// DEFAULT_MAX_IMAGE_BYTES); we just surface a localized note.
const SOFT_WARN_BYTES = 1024 * 1024;

interface Loaded {
  uri: string;
  name: string;
  type: string;
  bytes: number;
}

export function ImageToDataUri() {
  const t = useTranslations("Tools.imageToDataUri");
  const tc = useTranslations("Tools.common");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function rejectMessage(reason: FileRejectReason): string {
    switch (reason) {
      case "too-large":
        return tc("tooLarge", { max: formatBytes(DEFAULT_MAX_IMAGE_BYTES) });
      case "wrong-type":
        return tc("wrongType");
      case "read-failed":
        return tc("readFailed");
    }
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    const result = await readImageFile(file, { maxBytes: DEFAULT_MAX_IMAGE_BYTES });
    if (!result.ok) {
      setError(rejectMessage(result.reason));
      setLoaded(null);
      return;
    }
    setLoaded({
      uri: result.dataUri,
      name: result.file.name,
      type: result.file.type,
      bytes: result.file.size,
    });
  }

  function clear() {
    setLoaded(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const snippets = loaded ? buildSnippets(loaded.uri) : null;
  const isBig = loaded ? loaded.uri.length > SOFT_WARN_BYTES : false;

  return (
    <div className="grid gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label={t("dropzoneLabel")}
        aria-describedby={`${inputId}-formats`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "grid min-h-40 cursor-pointer place-items-center gap-2 rounded-lg border border-dashed bg-card/40 p-6 text-center motion-safe:transition-colors motion-safe:duration-(--motion-fast)",
          dragging
            ? "border-ring bg-ring/5"
            : "border-border motion-safe:hover:border-foreground/40",
          FOCUS_RING,
        )}
      >
        <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
        <span className="font-mono text-sm text-muted-foreground">
          {dragging ? t("dropActive") : t("dropPrompt")}
        </span>
        <span
          id={`${inputId}-formats`}
          className="max-w-full font-mono text-[0.6rem] uppercase tracking-[0.12em] text-balance text-muted-foreground/70"
        >
          {t("formats")}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-1"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {t("choose")}
        </Button>
        <label htmlFor={inputId} className="sr-only">
          {t("choose")}
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-mono text-[0.7rem] text-destructive"
        >
          {error}
        </p>
      ) : null}

      {loaded && snippets ? (
        <div className="grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <div className="grid gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied data URI, no optimization possible */}
            <img
              src={loaded.uri}
              alt={loaded.name}
              className="aspect-square h-auto w-full max-w-full rounded-md border border-border bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px] object-contain"
            />
            <Button type="button" size="sm" variant="outline" onClick={clear}>
              <X className="size-3.5" aria-hidden="true" /> {tc("clear")}
            </Button>
          </div>

          <div className="grid min-w-0 content-start gap-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.7rem] text-muted-foreground">
              <span className="min-w-0 truncate text-foreground">{loaded.name}</span>
              <span>{loaded.type}</span>
              <span>{t("fileSize", { size: formatBytes(loaded.bytes) })}</span>
              <span>{t("uriSize", { size: formatBytes(loaded.uri.length) })}</span>
            </div>

            {isBig ? (
              <p className="font-mono text-[0.65rem] text-warning">
                {t("sizeNote", { max: formatBytes(SOFT_WARN_BYTES) })}
              </p>
            ) : null}

            <Output label={t("dataUriLabel")} value={loaded.uri} />
            <Output label={t("imgLabel")} value={snippets.imgTag} />
            <Output label={t("cssLabel")} value={snippets.cssBackground} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Output({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <CopyButton value={value} label={label} className="shrink-0" />
      </div>
      <code className="block max-h-20 overflow-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[0.7rem] break-all">
        {value.length > 280 ? value.slice(0, 280) + "…" : value}
      </code>
    </div>
  );
}
