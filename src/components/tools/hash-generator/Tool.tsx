"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

async function digest(text: string, algo: Algo): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function HashGenerator() {
  const [input, setInput] = useState("M4rkyu");
  const [results, setResults] = useState<Record<Algo, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const next = {} as Record<Algo, string>;
      for (const algo of ALGOS) {
        next[algo] = input ? await digest(input, algo) : "";
      }
      if (!cancelled) setResults(next);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [input]);

  function copy(value: string, label: string) {
    void navigator.clipboard
      .writeText(value)
      .then(() => toast.success(`Copied ${label}`))
      .catch(() => toast.error("Copy failed"));
  }

  return (
    <div className="grid gap-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="Text to hash"
        aria-label="Text to hash"
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <ul className="grid gap-2">
        {ALGOS.map((algo) => (
          <li key={algo} className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {algo}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!results[algo]}
                onClick={() => copy(results[algo], algo)}
              >
                <Copy className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
            <code className="block overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-[0.7rem]">
              {results[algo] || "—"}
            </code>
          </li>
        ))}
      </ul>
      <p className="text-[0.65rem] text-muted-foreground/70">
        Computed via the browser&apos;s native SubtleCrypto. MD5 is omitted — it&apos;s broken for security
        use; reach for SHA-256 instead.
      </p>
    </div>
  );
}
