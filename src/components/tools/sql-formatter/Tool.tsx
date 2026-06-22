"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  formatSql,
  type KeywordCase,
} from "@/lib/tools/sql-formatter";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const SAMPLE = `select id, title, count(*) as posts from users u join posts p on p.user_id = u.id where u.active = true and p.published_at is not null group by u.id order by posts desc limit 10;`;

const KEYWORD_CASES: readonly KeywordCase[] = ["upper", "lower", "preserve"];
const INDENT_SIZES = [2, 4] as const;

/** Above this length we defer formatting ~150ms so typing stays responsive. */
const DEBOUNCE_THRESHOLD = 2000;
const DEBOUNCE_MS = 150;

const FIELD =
  "rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs min-h-9";

export function SqlFormatter() {
  const t = useTranslations("Tools.sqlFormatter");
  const tc = useTranslations("Tools.common");
  const [input, setInput] = useState(SAMPLE);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [indentSize, setIndentSize] = useState<number>(2);

  // Debounce only large input; small/medium queries format synchronously so
  // there is no perceptible lag for the common case. The effect never calls
  // setState synchronously — it only schedules a trailing snapshot — and the
  // memo reads live `input` whenever it is small enough to format on the spot.
  const isLarge = input.length > DEBOUNCE_THRESHOLD;
  const [debounced, setDebounced] = useState(input);
  useEffect(() => {
    if (!isLarge) return;
    const id = setTimeout(() => setDebounced(input), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [input, isLarge]);

  const source = isLarge ? debounced : input;
  const result = useMemo(
    () => formatSql(source, { keywordCase, indentSize }),
    [source, keywordCase, indentSize],
  );

  const isEmpty = result.empty;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">
            {t("keywordCase.label")}
          </span>
          <select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as KeywordCase)}
            aria-label={t("keywordCase.label")}
            className={cn(FIELD, FOCUS_RING_INSET)}
          >
            {KEYWORD_CASES.map((value) => (
              <option key={value} value={value}>
                {t(`keywordCase.${value}` as const)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">
            {t("indent")}
          </span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            aria-label={t("indent")}
            className={cn(FIELD, FOCUS_RING_INSET)}
          >
            {INDENT_SIZES.map((value) => (
              <option key={value} value={value}>
                {t("indentSpaces", { count: value })}
              </option>
            ))}
          </select>
        </label>

        <CopyButton
          value={result.output}
          label="SQL"
          disabled={isEmpty}
          className="motion-safe:transition-colors"
        >
          {t("copyOutput")}
        </CopyButton>

        <span
          className="ml-auto font-mono text-xs text-muted-foreground"
          aria-live="polite"
        >
          {result.fallback ? t("fallbackNote") : null}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          rows={12}
          aria-label={t("inputAria")}
          placeholder={t("inputPlaceholder")}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-6",
            FOCUS_RING_INSET,
          )}
        />

        <div className="grid min-w-0 gap-2">
          {isEmpty ? (
            <div
              className="grid min-h-48 place-items-center rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center"
              aria-live="polite"
            >
              <div className="grid gap-1">
                <p className="font-mono text-xs text-muted-foreground">
                  {tc("empty")}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  {tc("emptyHint")}
                </p>
              </div>
            </div>
          ) : (
            <pre
              aria-label={t("outputAria")}
              className="min-w-0 overflow-x-auto whitespace-pre rounded-md border border-border bg-card/40 px-3 py-3 font-mono text-xs leading-6"
            >
              {result.output}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
