"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import {
  analyzeSelector,
  formatSpecificity,
  type TokenColumn,
} from "@/lib/tools/specificity";
import { cn } from "@/lib/utils";

// Per-column surface treatment. Three inks max per theme — IDs ride the signal
// ink, classes the primary ring, elements the success ink; neutral + functional
// stay muted/warning so the breakdown reads without a fourth accent.
const COLUMN_STYLE: Record<TokenColumn, string> = {
  a: "border-signal/40 bg-signal/10 text-signal",
  b: "border-ring/40 bg-ring/10 text-ring",
  c: "border-success/40 bg-success/10 text-success",
  zero: "border-border bg-muted/30 text-muted-foreground",
  functional: "border-warning/40 bg-warning/10 text-warning",
};

const EXAMPLES = [
  "#nav .item a:hover",
  "ul li::before",
  "a:not(.btn, #x)",
  ".card:is(.a .b, #c)",
  ":where(.reset) .title",
];

export function Specificity() {
  const t = useTranslations("Tools.specificity");
  const tc = useTranslations("Tools.common");
  const inputId = useId();

  const [input, setInput] = useState("#nav .item a:hover");

  const { score, tokens } = useMemo(() => analyzeSelector(input), [input]);

  const trimmed = input.trim();
  const triple = formatSpecificity(score);

  const columns = [
    { key: "a" as const, count: score.a, label: t("columns.ids") },
    { key: "b" as const, count: score.b, label: t("columns.classes") },
    { key: "c" as const, count: score.c, label: t("columns.elements") },
  ];

  // A spoken-word equivalent of (a, b, c) for screen readers + the copy value.
  const spoken = columns
    .map((col) => `${col.count} ${col.label}`)
    .join(", ");

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <label
          htmlFor={inputId}
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {t("inputLabel")}
        </label>
        <Input
          id={inputId}
          type="text"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          className="min-w-0 font-mono"
        />
      </div>

      {/* Big (a, b, c) readout — stacks 1-col on the narrowest screens. */}
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "grid min-w-0 place-items-center gap-1 rounded-lg border p-3 text-center sm:p-4",
              COLUMN_STYLE[col.key],
            )}
          >
            <span className="font-display text-3xl font-black leading-none tabular-nums sm:text-4xl">
              {col.count}
            </span>
            <span className="font-mono text-[0.55rem] uppercase leading-tight tracking-[0.12em] opacity-80">
              {col.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <p className="text-center font-mono text-sm text-muted-foreground">
          {t("scoreLabel")}{" "}
          <span className="break-all text-foreground">{triple}</span>
        </p>
        <CopyButton value={triple} label={t("scoreNoun")} />
        {/* Spoken score for assistive tech, mirrored from the visual triple. */}
        <span className="sr-only" role="status" aria-live="polite">
          {t("scoreLabel")} {spoken}
        </span>
      </div>

      {/* Token breakdown — wraps freely, each chip break-all so long
          attribute/:is() args never overflow at 360px. */}
      {tokens.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={t("breakdownLabel")}>
          {tokens.map((tok, i) => (
            <li
              key={`${tok.text}-${i}`}
              className={cn(
                "break-all rounded-md border px-2 py-1 font-mono text-xs",
                COLUMN_STYLE[tok.column],
              )}
            >
              {tok.text}
            </li>
          ))}
        </ul>
      ) : trimmed.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground">
          {tc("emptyHint")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("tryLabel")}
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            className="min-h-9 break-all rounded-md border border-border px-2 py-1 font-mono text-[0.7rem] text-muted-foreground motion-safe:transition-colors motion-safe:duration-(--motion-fast) hover:border-foreground/40 hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      <p className="font-mono text-[0.6rem] leading-relaxed text-muted-foreground">
        {t("explanation")}
      </p>
    </div>
  );
}
