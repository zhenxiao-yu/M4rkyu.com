"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UrlCodec() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [scope, setScope] = useState<"component" | "uri">("component");
  const [input, setInput] = useState("hello world?next=/work&q=tailwind v4");

  const result = useMemo<
    { ok: true; output: string } | { ok: false; error: string }
  >(() => {
    if (!input) return { ok: true, output: "" };
    try {
      const encode = scope === "component" ? encodeURIComponent : encodeURI;
      const decode = scope === "component" ? decodeURIComponent : decodeURI;
      return { ok: true, output: mode === "encode" ? encode(input) : decode(input) };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, [input, mode, scope]);

  function copy() {
    if (!result.ok) return;
    void navigator.clipboard
      .writeText(result.output)
      .then(() => toast.success("Copied"))
      .catch(() => toast.error("Copy failed"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={mode} onChange={setMode} options={["encode", "decode"]} />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Scope</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "component" | "uri")}
            className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          >
            <option value="component">component</option>
            <option value="uri">full URI</option>
          </select>
        </label>
        <Button type="button" size="sm" variant="outline" onClick={copy} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        spellCheck={false}
        aria-label={mode === "encode" ? "Text to URL-encode" : "Text to URL-decode"}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <textarea
        readOnly
        value={result.ok ? result.output : result.error}
        rows={5}
        aria-label={mode === "encode" ? "URL-encoded output" : "URL-decoded output"}
        aria-live="polite"
        className={`w-full rounded-md border bg-card/40 px-3 py-2 font-mono text-xs ${result.ok ? "border-border" : "border-destructive/40 text-destructive"}`}
      />
    </div>
  );
}

function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          type="button"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${value === o ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
