"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  runHtmlEntities,
  type EntityMode,
  type EntityStyle,
} from "@/lib/tools/html-entities";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const MODES = ["encode", "decode"] as const;
const STYLES = ["named", "numeric"] as const;

export function HtmlEntities() {
  const t = useTranslations("Tools.htmlEntities");
  const tc = useTranslations("Tools.common");
  const [mode, setMode] = useState<EntityMode>("encode");
  const [style, setStyle] = useState<EntityStyle>("named");
  const [input, setInput] = useState(`<p>Hello & welcome — code "M4rkyu".</p>`);

  const result = useMemo(
    () => runHtmlEntities(input, mode, style),
    [input, mode, style],
  );

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
        {mode === "encode" ? (
          <label className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">{t("style")}</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as EntityStyle)}
              aria-label={t("style")}
              className={cn(
                "min-h-9 min-w-0 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs",
                FOCUS_RING_INSET,
              )}
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {t(`styleOption.${s}`)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <CopyButton
          value={result.output}
          label="HTML"
          disabled={result.empty}
          className="ml-auto"
        >
          {tc("copy")}
        </CopyButton>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {tc("input")}
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            spellCheck={false}
            aria-label={mode === "encode" ? t("inputAriaEncode") : t("inputAriaDecode")}
            placeholder={
              mode === "encode" ? t("placeholderEncode") : t("placeholderDecode")
            }
            className={cn(
              "w-full resize-y overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-xs break-all",
              FOCUS_RING_INSET,
            )}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {tc("output")}
          </span>
          <textarea
            readOnly
            value={result.output}
            rows={8}
            aria-label={mode === "encode" ? t("outputAriaEncode") : t("outputAriaDecode")}
            aria-live="polite"
            placeholder={result.empty ? tc("emptyHint") : undefined}
            className={cn(
              "w-full resize-y overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs break-all",
              FOCUS_RING_INSET,
            )}
          />
        </label>
      </div>
    </div>
  );
}
