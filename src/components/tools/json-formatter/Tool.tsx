"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SAMPLE = `{"name":"M4rkyu","stack":["next","tailwind"],"meta":{"year":2026}}`;

export function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo<
    { ok: true; output: string } | { ok: false; error: string }
  >(() => {
    if (!input.trim()) return { ok: true, output: "" };
    try {
      const parsed = JSON.parse(input);
      return { ok: true, output: JSON.stringify(parsed, null, indent) };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, [input, indent]);

  function copy() {
    if (!result.ok) return;
    void navigator.clipboard
      .writeText(result.output)
      .then(() => toast.success("Copied JSON"))
      .catch(() => toast.error("Copy failed"));
  }

  function minify() {
    if (!result.ok) return;
    try {
      setInput(JSON.stringify(JSON.parse(input)));
    } catch {
      /* surfaced via result */
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Indent</span>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>none</option>
          </select>
        </label>
        <Button type="button" size="sm" variant="outline" onClick={minify}>
          Minify
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={copy}
          disabled={!result.ok}
        >
          <Copy className="size-3.5" aria-hidden="true" />
          Copy output
        </Button>
        <span
          className={`ml-auto font-mono text-xs ${result.ok ? "text-muted-foreground" : "text-destructive"}`}
        >
          {result.ok ? "valid" : "invalid"}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          rows={14}
          aria-label="JSON input"
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
        />
        <textarea
          readOnly
          value={result.ok ? result.output : result.error}
          rows={14}
          aria-label="Formatted JSON output"
          aria-live="polite"
          className={`w-full rounded-md border bg-card/40 px-3 py-2 font-mono text-xs ${result.ok ? "border-border" : "border-destructive/40 text-destructive"}`}
        />
      </div>
    </div>
  );
}
