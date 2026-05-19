"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function encodeUtf8(text: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}
function decodeUtf8(text: string) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(text), (c) => c.charCodeAt(0)),
  );
}

export function Base64() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("hello world");

  const result = useMemo<
    { ok: true; output: string } | { ok: false; error: string }
  >(() => {
    if (!input) return { ok: true, output: "" };
    try {
      return {
        ok: true,
        output: mode === "encode" ? encodeUtf8(input) : decodeUtf8(input.trim()),
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, [input, mode]);

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
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] transition-colors ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copy}
          disabled={!result.ok}
          className="ml-auto"
        >
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder={mode === "encode" ? "Plain text" : "Base64 string"}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <textarea
        readOnly
        value={result.ok ? result.output : result.error}
        rows={6}
        className={`w-full rounded-md border bg-card/40 px-3 py-2 font-mono text-xs ${result.ok ? "border-border" : "border-destructive/40 text-destructive"}`}
      />
    </div>
  );
}
