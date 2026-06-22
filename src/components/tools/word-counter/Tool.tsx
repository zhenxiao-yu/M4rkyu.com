"use client";

import { useMemo, useState } from "react";
import { Eraser } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { countText, readingMinutes } from "@/lib/tools/word-counter";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

// Live text metrics. All counting is pure + code-point aware (emoji = 1 char,
// CJK ideographs counted individually) in @/lib/tools/word-counter and
// unit-tested there; this component is state + presentation only. Every stat is
// derived in one useMemo pass keyed on the input, so a keystroke is a single
// walk over the text rather than a regex-per-stat.

const DEFAULT_TEXT =
  "Paste anything here. Watch the stats below tick — characters, words, lines, sentences, paragraphs, and estimated read time.";

// Order is stable; labels resolve through the wordCounter namespace.
const STAT_KEYS = [
  "words",
  "characters",
  "charactersNoSpaces",
  "sentences",
  "paragraphs",
  "lines",
] as const;

export function WordCounter() {
  const t = useTranslations("Tools.wordCounter");
  const tc = useTranslations("Tools.common");
  const locale = useLocale();

  const [text, setText] = useState(DEFAULT_TEXT);

  const counts = useMemo(() => countText(text), [text]);
  const minutes = useMemo(() => readingMinutes(counts.words), [counts.words]);

  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const empty = text.length === 0;

  // A plain-text digest of every stat, for the clipboard.
  const summary = useMemo(
    () =>
      STAT_KEYS.map((key) => `${t(`stat.${key}`)}: ${nf.format(counts[key])}`)
        .concat(`${t("stat.readingTime")}: ${t("readMinutes", { min: minutes })}`)
        .join("\n"),
    [counts, minutes, nf, t],
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {tc("input")}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <CopyButton value={summary} label={t("statsLabel")} disabled={empty}>
            {tc("copy")}
          </CopyButton>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
            disabled={empty}
          >
            <Eraser className="size-3.5" aria-hidden="true" />
            {tc("clear")}
          </Button>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        spellCheck={false}
        aria-label={t("inputAria")}
        placeholder={tc("emptyHint")}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-6",
          FOCUS_RING_INSET,
        )}
      />

      {empty ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t("emptyHint")}
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STAT_KEYS.map((key) => (
          <li
            key={key}
            className={cn(
              "grid gap-1 rounded-md border border-border bg-card/40 p-3",
              "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
              "hover:border-ring/40",
            )}
          >
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t(`stat.${key}`)}
            </span>
            <span className="font-display text-2xl leading-none tabular-nums">
              {nf.format(counts[key])}
            </span>
          </li>
        ))}
        <li
          className={cn(
            "grid gap-1 rounded-md border border-border bg-card/40 p-3",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            "hover:border-ring/40",
          )}
        >
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
            {t("stat.readingTime")}
          </span>
          <span className="font-display text-2xl leading-none tabular-nums">
            {t("readMinutes", { min: minutes })}
          </span>
        </li>
      </ul>
    </div>
  );
}
