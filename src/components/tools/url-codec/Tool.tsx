"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  runUrlCodec,
  type CodecMode,
  type CodecScope,
} from "@/lib/tools/url-codec";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const MODES = ["encode", "decode"] as const;
const SCOPES = ["component", "uri"] as const;

export function UrlCodec() {
  const t = useTranslations("Tools.urlCodec");
  const tc = useTranslations("Tools.common");
  const [mode, setMode] = useState<CodecMode>("encode");
  const [scope, setScope] = useState<CodecScope>("component");
  const [input, setInput] = useState("hello world?next=/work&q=tailwind v4");

  const result = useMemo(() => runUrlCodec(input, mode, scope), [input, mode, scope]);

  const empty = result.ok && result.empty;
  const outputValue = result.ok ? result.output : t("malformed");
  const status = result.ok
    ? result.empty
      ? tc("empty")
      : tc("valid")
    : tc("invalid");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label={t("modeLabel")}
          className="inline-flex min-w-0 rounded-md border border-border bg-card/40 p-0.5"
        >
          {MODES.map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "min-h-9 rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.15em]",
                "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                FOCUS_RING_INSET,
                mode === m
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`mode.${m}`)}
            </button>
          ))}
        </div>
        <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">{t("scope")}</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as CodecScope)}
            aria-label={t("scope")}
            className={cn(
              "min-h-9 min-w-0 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs",
              FOCUS_RING_INSET,
            )}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {t(`scopeOption.${s}`)}
              </option>
            ))}
          </select>
        </label>
        <CopyButton
          value={result.ok ? result.output : ""}
          label="URL"
          disabled={!result.ok || result.empty}
          className="ml-auto"
        >
          {t("copyOutput")}
        </CopyButton>
        <span
          className={cn(
            "w-full font-mono text-xs sm:w-auto",
            result.ok ? "text-muted-foreground" : "text-destructive",
          )}
          aria-live="polite"
        >
          {status}
        </span>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        spellCheck={false}
        aria-label={mode === "encode" ? t("inputAriaEncode") : t("inputAriaDecode")}
        placeholder={mode === "encode" ? t("placeholderEncode") : t("placeholderDecode")}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs break-all",
          FOCUS_RING_INSET,
        )}
      />
      <textarea
        readOnly
        value={empty ? "" : outputValue}
        rows={5}
        aria-label={mode === "encode" ? t("outputAriaEncode") : t("outputAriaDecode")}
        aria-live="polite"
        placeholder={tc("emptyHint")}
        className={cn(
          "w-full resize-y rounded-md border bg-card/40 px-3 py-2 font-mono text-xs break-all",
          FOCUS_RING_INSET,
          result.ok ? "border-border" : "border-destructive/40 text-destructive",
        )}
      />
    </div>
  );
}
