"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function splitWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-./\\]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const transforms: { key: string; label: string; apply: (s: string) => string }[] = [
  { key: "camel", label: "camelCase", apply: (s) => splitWords(s).map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join("") },
  { key: "pascal", label: "PascalCase", apply: (s) => splitWords(s).map(cap).join("") },
  { key: "snake", label: "snake_case", apply: (s) => splitWords(s).map((w) => w.toLowerCase()).join("_") },
  { key: "kebab", label: "kebab-case", apply: (s) => splitWords(s).map((w) => w.toLowerCase()).join("-") },
  { key: "constant", label: "CONSTANT_CASE", apply: (s) => splitWords(s).map((w) => w.toUpperCase()).join("_") },
  { key: "title", label: "Title Case", apply: (s) => splitWords(s).map(cap).join(" ") },
  { key: "sentence", label: "Sentence case", apply: (s) => { const w = splitWords(s).map((x) => x.toLowerCase()); return w.length ? cap(w[0]) + (w.length > 1 ? " " + w.slice(1).join(" ") : "") : ""; } },
  { key: "upper", label: "UPPERCASE", apply: (s) => s.toUpperCase() },
  { key: "lower", label: "lowercase", apply: (s) => s.toLowerCase() },
];

function cap(word: string) {
  return word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "";
}

export function CaseConverter() {
  const [input, setInput] = useState("the quick brown fox jumps over the lazy dog");

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        aria-label="Text to convert"
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
      />
      <ul className="grid gap-1.5">
        {transforms.map(({ key, label, apply }) => {
          const out = apply(input);
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2"
            >
              <span className="w-32 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </span>
              <code className="flex-1 truncate font-mono text-xs">{out || "—"}</code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!out}
                onClick={() => copy(out, label)}
              >
                <Copy className="size-3.5" aria-hidden="true" />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
