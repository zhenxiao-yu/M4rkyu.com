"use client";

import { useRef, useState } from "react";
import { Copy, ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, FOCUS_RING } from "@/lib/utils";

interface Loaded {
  uri: string;
  name: string;
  type: string;
  bytes: number;
}

function humanBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageToDataUri() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That's not an image file");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Couldn't read that file");
    reader.onload = () => {
      const uri = typeof reader.result === "string" ? reader.result : "";
      if (!uri) {
        toast.error("Couldn't read that file");
        return;
      }
      setLoaded({ uri, name: file.name, type: file.type, bytes: file.size });
    };
    reader.readAsDataURL(file);
  }

  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose or drop an image"
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
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "grid min-h-40 cursor-pointer place-items-center gap-2 rounded-lg border border-dashed bg-card/40 p-6 text-center transition-colors duration-(--motion-fast)",
          dragging ? "border-ring bg-ring/5" : "border-border hover:border-foreground/40",
          FOCUS_RING,
        )}
      >
        <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
        <span className="font-mono text-sm text-muted-foreground">
          {dragging ? "drop to encode" : "click or drop an image"}
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground/70">
          png · jpg · svg · webp · gif — stays on your device
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {loaded ? (
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <div className="grid gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied data URI, no optimization possible */}
            <img
              src={loaded.uri}
              alt={loaded.name}
              className="aspect-square w-full rounded-md border border-border bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px] object-contain"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setLoaded(null)}
            >
              <X className="size-3.5" aria-hidden="true" /> Clear
            </Button>
          </div>

          <div className="grid content-start gap-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.7rem] text-muted-foreground">
              <span className="truncate text-foreground">{loaded.name}</span>
              <span>{loaded.type}</span>
              <span>file · {humanBytes(loaded.bytes)}</span>
              <span>uri · {humanBytes(loaded.uri.length)}</span>
            </div>
            {loaded.uri.length > 1024 * 1024 ? (
              <p className="font-mono text-[0.65rem] text-warning">
                Over 1 MB encoded — inlining this will bloat your CSS/HTML.
                Prefer a real asset URL.
              </p>
            ) : null}

            <Output
              label="Data URI"
              value={loaded.uri}
              onCopy={() => copy(loaded.uri, "data URI")}
            />
            <Output
              label="<img> tag"
              value={`<img src="${loaded.uri}" alt="" />`}
              onCopy={() => copy(`<img src="${loaded.uri}" alt="" />`, "<img> tag")}
            />
            <Output
              label="CSS background"
              value={`background-image: url("${loaded.uri}");`}
              onCopy={() => copy(`background-image: url("${loaded.uri}");`, "CSS")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Output({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <code className="block max-h-20 overflow-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[0.7rem] break-all">
        {value.length > 280 ? value.slice(0, 280) + "…" : value}
      </code>
    </div>
  );
}
