"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { convertAll, type CaseKey } from "@/lib/tools/case";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

// Canonical, technical case names — kept verbatim across locales because
// developers expect the literal strings. The localized layer only supplies the
// input affordances and empty state via next-intl.
const CASE_LABELS: Record<CaseKey, string> = {
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
  constant: "CONSTANT_CASE",
  title: "Title Case",
  sentence: "Sentence case",
  upper: "UPPERCASE",
  lower: "lowercase",
};

export function CaseConverter() {
  const t = useTranslations("Tools.caseConverter");
  const tc = useTranslations("Tools.common");
  const [input, setInput] = useState("the quick brown fox jumps over the lazy dog");

  const { empty, results } = useMemo(() => convertAll(input), [input]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {tc("input")}
        </span>
        <button
          type="button"
          onClick={() => setInput("")}
          disabled={input === ""}
          className={cn(
            "ml-auto min-h-9 rounded-md border border-border bg-card/40 px-3 py-1 font-mono text-xs text-muted-foreground",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            "hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
            FOCUS_RING_INSET,
          )}
        >
          {tc("clear")}
        </button>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        spellCheck={false}
        placeholder={t("placeholder")}
        aria-label={t("inputAria")}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-sm break-all",
          FOCUS_RING_INSET,
        )}
      />

      {empty ? (
        <div
          className="grid gap-1 rounded-md border border-dashed border-border bg-card/30 px-3 py-6 text-center"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-foreground">{tc("empty")}</p>
          <p className="text-xs text-muted-foreground">{tc("emptyHint")}</p>
        </div>
      ) : (
        <ul className="grid gap-1.5">
          {results.map(({ key, value }) => {
            const caseName = CASE_LABELS[key];
            return (
              <li
                key={key}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 px-3 py-2 min-w-0"
              >
                <span className="w-28 shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {caseName}
                </span>
                <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs break-all">
                  {value || "—"}
                </code>
                <CopyButton
                  value={value}
                  label={caseName}
                  disabled={!value}
                  className="ml-auto"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
