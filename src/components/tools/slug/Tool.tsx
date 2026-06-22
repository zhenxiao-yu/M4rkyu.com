"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { runSlug, type SlugSeparator } from "@/lib/tools/slug";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const SEPARATORS = ["-", "_"] as const;

export function SlugGenerator() {
  const t = useTranslations("Tools.slug");
  const tc = useTranslations("Tools.common");
  const [input, setInput] = useState("Building React Things — 2026 edition");
  const [separator, setSeparator] = useState<SlugSeparator>("-");
  const [lowercase, setLowercase] = useState(true);

  const { slug, empty } = useMemo(
    () => runSlug(input, { separator, lowercase }),
    [input, separator, lowercase],
  );

  return (
    <div className="grid gap-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        aria-label={t("inputAria")}
        placeholder={t("placeholder")}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm break-words",
          FOCUS_RING_INSET,
        )}
      />

      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <div
          role="radiogroup"
          aria-label={t("separatorLabel")}
          className="inline-flex min-w-0 rounded-md border border-border bg-card/40 p-0.5"
        >
          {SEPARATORS.map((s) => (
            <button
              key={s}
              role="radio"
              type="button"
              aria-checked={separator === s}
              aria-label={t(`separatorOption.${s === "-" ? "hyphen" : "underscore"}`)}
              onClick={() => setSeparator(s)}
              className={cn(
                "min-h-9 rounded-sm px-3 py-1 font-mono text-xs",
                "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                FOCUS_RING_INSET,
                separator === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={lowercase}
          onClick={() => setLowercase((v) => !v)}
          className={cn(
            "inline-flex min-h-9 min-w-0 items-center gap-2 rounded-md border border-border px-3 py-1 text-xs",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            FOCUS_RING_INSET,
            lowercase
              ? "bg-background text-foreground shadow-sm"
              : "bg-card/40 text-muted-foreground hover:text-foreground",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full",
              lowercase ? "bg-ring" : "bg-muted-foreground/40",
            )}
          />
          <span className="font-mono uppercase tracking-[0.15em]">
            {t("lowercase")}
          </span>
        </button>

        <CopyButton
          value={slug}
          label="slug"
          disabled={empty}
          className="ml-auto"
        >
          {tc("copy")}
        </CopyButton>
      </div>

      <code
        aria-label={tc("output")}
        aria-live="polite"
        className={cn(
          "block rounded-md border border-border bg-card/40 px-3 py-3 font-mono text-sm break-all",
          empty && "text-muted-foreground",
        )}
      >
        {empty ? tc("empty") : slug}
      </code>
      {empty ? (
        <p className="text-xs text-muted-foreground">{tc("emptyHint")}</p>
      ) : null}
    </div>
  );
}
