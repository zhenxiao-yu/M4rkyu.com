"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  diffText,
  formatDiff,
  type DiffLine,
} from "@/lib/tools/text-diff";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Button } from "@/components/ui/button";

const SAMPLE_ORIGINAL = "the quick brown fox\njumps over the lazy dog\n";
const SAMPLE_CHANGED = "the slow brown fox\njumps over the lazy cat\n";

/**
 * Debounce a fast-changing value. Diffing two large texts is O(n·m) per run,
 * so we keep the textareas perfectly responsive by only recomputing the diff
 * ~180ms after the last keystroke instead of on every character.
 */
function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function TextDiff() {
  const t = useTranslations("Tools.textDiff");
  const tc = useTranslations("Tools.common");

  const [original, setOriginal] = useState(SAMPLE_ORIGINAL);
  const [changed, setChanged] = useState(SAMPLE_CHANGED);

  // Debounce both inputs, then derive the diff in a memo keyed on the debounced
  // values — typing never blocks on the diff, and identical re-renders are free.
  const debouncedOriginal = useDebounced(original, 180);
  const debouncedChanged = useDebounced(changed, 180);
  const result = useMemo(
    () => diffText(debouncedOriginal, debouncedChanged),
    [debouncedOriginal, debouncedChanged],
  );

  const clipboardText = useMemo(
    () => formatDiff(result.lines),
    [result.lines],
  );

  const bothEmpty = original === "" && changed === "";
  const hasInput = original !== "" || changed !== "";

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <Pane
          id="text-diff-original"
          label={t("original")}
          value={original}
          onChange={setOriginal}
        />
        <Pane
          id="text-diff-changed"
          label={t("changed")}
          value={changed}
          onChange={setChanged}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-hidden="true"
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {tc("output")}
        </span>
        {!bothEmpty && !result.truncated ? (
          <span
            className="flex items-center gap-2 font-mono text-xs tabular-nums"
            aria-label={t("summaryAria", {
              additions: result.additions,
              deletions: result.deletions,
            })}
          >
            <span className="rounded-sm bg-success/15 px-1.5 py-0.5 text-success">
              {t("additions", { count: result.additions })}
            </span>
            <span className="rounded-sm bg-destructive/15 px-1.5 py-0.5 text-destructive">
              {t("deletions", { count: result.deletions })}
            </span>
          </span>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setOriginal("");
            setChanged("");
          }}
          disabled={bothEmpty}
        >
          {tc("clear")}
        </Button>
        <CopyButton
          value={clipboardText}
          label={tc("output")}
          size="sm"
          disabled={!hasInput || result.truncated}
          className="ml-auto min-h-9"
        >
          {tc("copy")}
        </CopyButton>
      </div>

      {bothEmpty ? (
        <EmptyState title={tc("empty")} hint={tc("emptyHint")} />
      ) : result.truncated ? (
        <Notice>{t("truncated")}</Notice>
      ) : result.identical ? (
        <Notice>{t("identical")}</Notice>
      ) : (
        <pre
          className="overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-border bg-card/40 font-mono text-xs leading-5"
          aria-label={t("diffAria")}
        >
          {result.lines.map((line, i) => (
            <DiffRow key={i} line={line} t={t} />
          ))}
        </pre>
      )}
    </div>
  );
}

function DiffRow({
  line,
  t,
}: {
  line: DiffLine;
  t: ReturnType<typeof useTranslations>;
}) {
  const sign = line.op === "add" ? "+" : line.op === "remove" ? "-" : " ";
  // The sign carries the meaning so added/removed never rely on color alone;
  // screen readers get an explicit per-row label on changed lines.
  const rowLabel =
    line.op === "add"
      ? t("addedLine")
      : line.op === "remove"
        ? t("removedLine")
        : undefined;

  return (
    <div
      className={cn(
        "flex gap-2 px-3 py-0.5",
        line.op === "add" && "bg-success/15 text-success",
        line.op === "remove" && "bg-destructive/15 text-destructive",
        line.op === "equal" && "text-muted-foreground",
      )}
    >
      <span aria-hidden="true" className="select-none opacity-70">
        {sign}
      </span>
      {rowLabel ? <span className="sr-only">{rowLabel}</span> : null}
      <span className="min-w-0">{line.text || " "}</span>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/20 px-3 py-6 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card/40 px-3 py-4 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Pane({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        spellCheck={false}
        aria-label={label}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-5",
          "motion-safe:transition-colors",
          FOCUS_RING_INSET,
        )}
      />
    </div>
  );
}
