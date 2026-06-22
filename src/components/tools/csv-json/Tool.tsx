"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { csvToJson, jsonToCsv, type CsvJsonResult } from "@/lib/tools/csv-json";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

type Direction = "csv-to-json" | "json-to-csv";

const DIRECTIONS = ["csv-to-json", "json-to-csv"] as const;
const SAMPLE_CSV = "name,role\nMark,engineer\nZhen,designer";
// Debounce keystrokes so a large paste doesn't re-parse on every character.
const DEBOUNCE_MS = 180;

export function CsvJson() {
  const t = useTranslations("Tools.csvJson");
  const tc = useTranslations("Tools.common");
  const [direction, setDirection] = useState<Direction>("csv-to-json");
  const [input, setInput] = useState(SAMPLE_CSV);
  const [deferred, setDeferred] = useState(SAMPLE_CSV);

  useEffect(() => {
    const id = window.setTimeout(() => setDeferred(input), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [input]);

  const result = useMemo<CsvJsonResult>(
    () => (direction === "csv-to-json" ? csvToJson(deferred) : jsonToCsv(deferred)),
    [direction, deferred],
  );

  const empty = result.ok && result.empty;
  const errorText = !result.ok
    ? result.reason === "non-array"
      ? t("error.nonArray")
      : t("error.malformedJson")
    : "";
  const outputValue = result.ok ? (result.empty ? "" : result.output) : errorText;
  const status = result.ok ? (result.empty ? tc("empty") : tc("valid")) : tc("invalid");

  const isCsvToJson = direction === "csv-to-json";
  const copyLabel = isCsvToJson ? "JSON" : "CSV";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label={t("directionLabel")}
          className="inline-flex min-w-0 rounded-md border border-border bg-card/40 p-0.5"
        >
          {DIRECTIONS.map((d) => (
            <button
              key={d}
              role="tab"
              type="button"
              aria-selected={direction === d}
              onClick={() => setDirection(d)}
              className={cn(
                "min-h-9 rounded-sm px-3 py-1 text-xs font-medium uppercase tracking-[0.15em]",
                "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                FOCUS_RING_INSET,
                direction === d
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`direction.${d}`)}
            </button>
          ))}
        </div>
        <CopyButton
          value={result.ok && !result.empty ? result.output : ""}
          label={copyLabel}
          disabled={!result.ok || result.empty}
          className="ml-auto"
        >
          {tc("copy")}
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
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          aria-label={isCsvToJson ? t("inputAriaCsv") : t("inputAriaJson")}
          placeholder={isCsvToJson ? t("placeholderCsv") : t("placeholderJson")}
          className={cn(
            "min-h-36 w-full resize-y overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-xs",
            FOCUS_RING_INSET,
          )}
        />
        <textarea
          readOnly
          value={empty ? "" : outputValue}
          rows={14}
          aria-label={isCsvToJson ? t("outputAriaJson") : t("outputAriaCsv")}
          aria-live="polite"
          placeholder={tc("emptyHint")}
          className={cn(
            "min-h-36 w-full resize-y overflow-x-auto rounded-md border bg-card/40 px-3 py-2 font-mono text-xs",
            FOCUS_RING_INSET,
            result.ok ? "border-border" : "border-destructive/40 text-destructive",
          )}
        />
      </div>
    </div>
  );
}
