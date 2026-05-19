"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function slugify(text: string, separator: "-" | "_"): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/['"`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "")
    .replace(new RegExp(`${separator}{2,}`, "g"), separator);
}

export function SlugGenerator() {
  const [input, setInput] = useState("Building React Things — 2026 edition");
  const [separator, setSeparator] = useState<"-" | "_">("-");

  const slug = useMemo(() => slugify(input, separator), [input, separator]);

  function copy() {
    void navigator.clipboard.writeText(slug).then(() => toast.success("Copied slug"));
  }

  return (
    <div className="grid gap-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        placeholder="Any text"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Separator
        </span>
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["-", "_"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              type="button"
              aria-selected={separator === s}
              onClick={() => setSeparator(s)}
              className={`rounded-sm px-3 py-1 font-mono text-xs ${separator === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!slug} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <code className="block overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-3 font-mono text-sm">
        {slug || "—"}
      </code>
    </div>
  );
}
