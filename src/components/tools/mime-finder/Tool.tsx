"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Mime {
  ext: string;
  mime: string;
  description: string;
}

const TYPES: Mime[] = [
  { ext: ".aac", mime: "audio/aac", description: "AAC audio" },
  { ext: ".avif", mime: "image/avif", description: "AVIF image" },
  { ext: ".bin", mime: "application/octet-stream", description: "Any kind of binary data" },
  { ext: ".bmp", mime: "image/bmp", description: "Windows OS/2 Bitmap" },
  { ext: ".css", mime: "text/css", description: "Cascading Style Sheets" },
  { ext: ".csv", mime: "text/csv", description: "Comma-separated values" },
  { ext: ".doc", mime: "application/msword", description: "Microsoft Word" },
  { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Microsoft Word (OpenXML)" },
  { ext: ".epub", mime: "application/epub+zip", description: "Electronic publication" },
  { ext: ".gif", mime: "image/gif", description: "Graphics Interchange Format" },
  { ext: ".gz", mime: "application/gzip", description: "GZip compressed archive" },
  { ext: ".htm", mime: "text/html", description: "HyperText Markup Language" },
  { ext: ".html", mime: "text/html", description: "HyperText Markup Language" },
  { ext: ".ico", mime: "image/vnd.microsoft.icon", description: "Icon" },
  { ext: ".ics", mime: "text/calendar", description: "iCalendar" },
  { ext: ".jpg", mime: "image/jpeg", description: "JPEG image" },
  { ext: ".jpeg", mime: "image/jpeg", description: "JPEG image" },
  { ext: ".js", mime: "text/javascript", description: "JavaScript" },
  { ext: ".json", mime: "application/json", description: "JSON" },
  { ext: ".jsonld", mime: "application/ld+json", description: "JSON-LD" },
  { ext: ".md", mime: "text/markdown", description: "Markdown" },
  { ext: ".mjs", mime: "text/javascript", description: "ES module" },
  { ext: ".mp3", mime: "audio/mpeg", description: "MP3 audio" },
  { ext: ".mp4", mime: "video/mp4", description: "MP4 video" },
  { ext: ".otf", mime: "font/otf", description: "OpenType font" },
  { ext: ".pdf", mime: "application/pdf", description: "PDF document" },
  { ext: ".png", mime: "image/png", description: "PNG image" },
  { ext: ".rar", mime: "application/vnd.rar", description: "RAR archive" },
  { ext: ".rtf", mime: "application/rtf", description: "Rich Text Format" },
  { ext: ".svg", mime: "image/svg+xml", description: "Scalable Vector Graphics" },
  { ext: ".tar", mime: "application/x-tar", description: "Tape archive" },
  { ext: ".ts", mime: "video/mp2t", description: "MPEG transport stream" },
  { ext: ".tsv", mime: "text/tab-separated-values", description: "Tab-separated values" },
  { ext: ".ttf", mime: "font/ttf", description: "TrueType font" },
  { ext: ".txt", mime: "text/plain", description: "Plain text" },
  { ext: ".wasm", mime: "application/wasm", description: "WebAssembly module" },
  { ext: ".wav", mime: "audio/wav", description: "Waveform audio" },
  { ext: ".webm", mime: "video/webm", description: "WebM video" },
  { ext: ".webp", mime: "image/webp", description: "WEBP image" },
  { ext: ".woff", mime: "font/woff", description: "Web Open Font Format" },
  { ext: ".woff2", mime: "font/woff2", description: "Web Open Font Format 2" },
  { ext: ".xml", mime: "application/xml", description: "XML" },
  { ext: ".yaml", mime: "application/yaml", description: "YAML" },
  { ext: ".yml", mime: "application/yaml", description: "YAML" },
  { ext: ".zip", mime: "application/zip", description: "ZIP archive" },
];

export function MimeFinder() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\./, "");
    if (!q) return TYPES;
    return TYPES.filter(
      (t) =>
        t.ext.toLowerCase().includes(q) || t.mime.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [query]);

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by extension, MIME, or name…"
        aria-label="Search MIME types"
        className="font-mono"
      />
      <ul className="grid gap-1.5">
        {filtered.map((t) => (
          <li key={`${t.ext}-${t.mime}`} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2">
            <code className="font-mono text-xs text-foreground">{t.ext}</code>
            <div className="min-w-0">
              <code className="block truncate font-mono text-xs">{t.mime}</code>
              <span className="block truncate text-[0.65rem] text-muted-foreground">{t.description}</span>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(t.mime, t.mime)} aria-label={`Copy ${t.mime}`}>
              <Copy className="size-3" aria-hidden="true" />
            </Button>
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-md border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">No matches.</li>
        ) : null}
      </ul>
    </div>
  );
}
