"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { bufferToHex, HASH_ALGOS, type HashAlgo } from "@/lib/tools/hash";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Button } from "@/components/ui/button";

type Results = Record<HashAlgo, string>;

const EMPTY_RESULTS: Results = {
  "SHA-1": "",
  "SHA-256": "",
  "SHA-384": "",
  "SHA-512": "",
};

/** Web Crypto digest — async, secure-context only. Caller guards availability. */
async function digest(text: string, algo: HashAlgo): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algo, data);
  return bufferToHex(hash);
}

export function HashGenerator() {
  const t = useTranslations("Tools.hashGenerator");
  const tc = useTranslations("Tools.common");

  const [input, setInput] = useState("M4rkyu");
  const [results, setResults] = useState<Results>(EMPTY_RESULTS);
  const [failed, setFailed] = useState(false);
  // `crypto.subtle` is undefined outside secure contexts (plain http, some
  // embedded webviews). `null` until the first client effect resolves it, so
  // SSR + first paint agree before the whole UI branches on it.
  const [available, setAvailable] = useState<boolean | null>(null);

  // Debounced, race-safe recompute. A monotonically increasing run id lets a
  // slow earlier digest's result be discarded if the input has since changed,
  // so out-of-order async never paints a stale hash. State is only ever set
  // asynchronously (timeout / promise), never synchronously in the effect body.
  const runId = useRef(0);
  useEffect(() => {
    const secure =
      typeof crypto !== "undefined" &&
      typeof crypto.subtle?.digest === "function";

    const id = (runId.current += 1);
    const timer = setTimeout(() => {
      if (id !== runId.current) return;
      setAvailable(secure);
      if (!secure) return;
      if (!input) {
        setResults(EMPTY_RESULTS);
        setFailed(false);
        return;
      }
      void Promise.all(
        HASH_ALGOS.map(async (algo) => {
          try {
            return [algo, await digest(input, algo)] as const;
          } catch {
            return [algo, ""] as const;
          }
        }),
      ).then((entries) => {
        if (id !== runId.current) return; // a newer keystroke won
        const next = { ...EMPTY_RESULTS };
        let anyFailed = false;
        for (const [algo, hex] of entries) {
          next[algo] = hex;
          if (!hex) anyFailed = true;
        }
        setResults(next);
        setFailed(anyFailed);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [input]);

  const hasOutput = Boolean(input) && HASH_ALGOS.some((a) => results[a]);
  const allHashes = HASH_ALGOS.filter((a) => results[a])
    .map((a) => `${a}: ${results[a]}`)
    .join("\n");

  if (available === false) {
    return (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-md border border-border bg-card/40 px-3 py-3 text-xs text-muted-foreground"
      >
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-foreground/70"
          aria-hidden="true"
        />
        <p className="min-w-0">{t("unavailable")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label
          htmlFor="hash-input"
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {tc("input")}
        </label>
        <textarea
          id="hash-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={t("placeholder")}
          aria-label={t("inputAria")}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs",
            FOCUS_RING_INSET,
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setInput("")}
          disabled={!input}
        >
          {tc("clear")}
        </Button>
        <CopyButton
          value={allHashes}
          label={t("allLabel")}
          size="sm"
          disabled={!hasOutput}
          className="ml-auto"
        >
          {tc("copyAll")}
        </CopyButton>
      </div>

      {failed ? (
        <p role="alert" className="text-xs text-destructive">
          {t("hashFailed")}
        </p>
      ) : null}

      {!input ? (
        <div className="rounded-md border border-dashed border-border bg-card/20 px-3 py-6 text-center">
          <p className="text-sm font-medium text-foreground">{tc("empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tc("emptyHint")}</p>
        </div>
      ) : (
        <ul className="grid gap-2">
          {HASH_ALGOS.map((algo) => {
            const value = results[algo];
            return (
              <li key={algo} className="grid gap-1.5">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {algo}
                  </span>
                  <CopyButton
                    value={value}
                    label={algo}
                    size="sm"
                    disabled={!value}
                    className="ml-auto"
                  />
                </div>
                <code
                  className="block break-all rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs text-foreground/90"
                  aria-live="polite"
                >
                  {value || "—"}
                </code>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[0.65rem] leading-relaxed text-muted-foreground/70">
        {t("note")}
      </p>
    </div>
  );
}
