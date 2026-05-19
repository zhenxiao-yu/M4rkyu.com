"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const NAMED: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "©": "&copy;",
  "®": "&reg;",
  "™": "&trade;",
  "—": "&mdash;",
  "–": "&ndash;",
  "…": "&hellip;",
  " ": "&nbsp;",
};
const NAMED_REVERSE = Object.fromEntries(
  Object.entries(NAMED).map(([k, v]) => [v, k]),
) as Record<string, string>;

function encode(text: string, mode: "named" | "numeric") {
  return Array.from(text)
    .map((ch) => {
      if (mode === "named" && NAMED[ch]) return NAMED[ch];
      const code = ch.codePointAt(0)!;
      if (code < 0x20 || code > 0x7e) return `&#${code};`;
      if (NAMED[ch]) return NAMED[ch];
      return ch;
    })
    .join("");
}

function decode(text: string) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&[a-zA-Z]+;/g, (m) => NAMED_REVERSE[m] ?? m);
}

export function HtmlEntities() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [namedMode, setNamedMode] = useState<"named" | "numeric">("named");
  const [input, setInput] = useState("<p>Hello & welcome — code “M4rkyu”.</p>");

  const output = useMemo(
    () => (mode === "encode" ? encode(input, namedMode) : decode(input)),
    [input, mode, namedMode],
  );

  function copy() {
    void navigator.clipboard.writeText(output).then(() => toast.success("Copied"));
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
              className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] ${mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {m}
            </button>
          ))}
        </div>
        {mode === "encode" ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">Style</span>
            <select
              value={namedMode}
              onChange={(e) => setNamedMode(e.target.value as "named" | "numeric")}
              className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
            >
              <option value="named">named (&amp;amp;)</option>
              <option value="numeric">numeric (&amp;#38;)</option>
            </select>
          </label>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={copy} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <textarea
        readOnly
        value={output}
        rows={6}
        className="w-full rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs"
      />
    </div>
  );
}
