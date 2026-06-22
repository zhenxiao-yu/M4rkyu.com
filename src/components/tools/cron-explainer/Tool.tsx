"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import {
  type CronError,
  type CronField,
  type CronFieldName,
  type CronFields,
  type CronTerm,
  parseCron,
} from "@/lib/tools/cron";
import { cn, FOCUS_RING } from "@/lib/utils";

/** Preset examples — cron strings are universal, labels are localized by key. */
const PRESETS: { key: string; cron: string }[] = [
  { key: "everyMinute", cron: "* * * * *" },
  { key: "every5", cron: "*/5 * * * *" },
  { key: "hourly", cron: "0 * * * *" },
  { key: "midnight", cron: "0 0 * * *" },
  { key: "weekdays9", cron: "0 9 * * 1-5" },
  { key: "firstOfMonth", cron: "0 6 1 * *" },
];

/** Translation keys for the field labels, in display order. */
const FIELD_ORDER: CronFieldName[] = [
  "second",
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
];

export function CronExplainer() {
  const t = useTranslations("Tools.cronExplainer");
  const tc = useTranslations("Tools.common");
  const inputId = useId();
  const regionId = useId();

  const [input, setInput] = useState("0 9 * * 1-5");

  const result = useMemo(() => parseCron(input), [input]);

  // Day / month name lookups, resolved through localized keys so both en + zh
  // read naturally. Index 0 = Sunday for days; months are 1-based (index 0 ""),
  const dayName = (n: number) => t(`days.${n}` as const);
  const monthName = (n: number) => t(`months.${n}` as const);

  /** Localized name for a single atom inside a field (number, day, or month). */
  function atomName(field: CronFieldName, value: number): string {
    if (field === "dayOfWeek") return dayName(value);
    if (field === "month") return monthName(value);
    return String(value);
  }

  /** A field's unit noun, e.g. "minute" / "hour", for step + plain phrasing. */
  function unit(field: CronFieldName): string {
    return t(`units.${field}` as const);
  }

  /** Turn one structured term into a localized phrase fragment. */
  function termPhrase(field: CronFieldName, term: CronTerm): string {
    switch (term.kind) {
      case "all":
        return t("term.every", { unit: unit(field) });
      case "value":
        return t("term.at", {
          unit: unit(field),
          value: atomName(field, term.value),
        });
      case "range":
        return t("term.range", {
          unit: unit(field),
          from: atomName(field, term.from),
          to: atomName(field, term.to),
        });
      case "step": {
        if (term.from === null && term.to === null) {
          return t("term.everyN", { n: term.step, unit: unit(field) });
        }
        if (term.to === null) {
          return t("term.everyNFrom", {
            n: term.step,
            unit: unit(field),
            from: atomName(field, term.from ?? 0),
          });
        }
        return t("term.everyNBetween", {
          n: term.step,
          unit: unit(field),
          from: atomName(field, term.from ?? 0),
          to: atomName(field, term.to),
        });
      }
    }
  }

  /** Compose a field's clause from its comma-separated terms. */
  function fieldClause(field: CronField): string | null {
    // A bare "*" contributes nothing to the every-N-style summary except for
    // minute, where "every minute" carries meaning. For the others a wildcard
    // is the implicit default, so we skip it to keep the sentence readable.
    if (field.isWildcard && field.name !== "minute" && field.name !== "second") {
      return null;
    }
    const phrases = field.terms.map((term) => termPhrase(field.name, term));
    return phrases.join(t("listJoin"));
  }

  /** Build the full plain-language explanation from the structured model. */
  function explain(fields: CronFields): string {
    const order: (CronField | undefined)[] = [
      fields.second,
      fields.minute,
      fields.hour,
      fields.dayOfMonth,
      fields.month,
      fields.dayOfWeek,
    ];
    const clauses = order
      .filter((f): f is CronField => Boolean(f))
      .map(fieldClause)
      .filter((c): c is string => Boolean(c));
    const body = clauses.join(t("clauseJoin"));
    return t("runs", { body });
  }

  /** Map a typed parse error to a localized message. */
  function errorMessage(error: CronError): string {
    switch (error.code) {
      case "empty":
        return tc("empty");
      case "fieldCount":
        return t("error.fieldCount", { count: error.count });
      case "outOfRange":
        return t("error.outOfRange", {
          field: t(`fields.${error.field}` as const),
          value: error.value,
        });
      case "badRange":
        return t("error.badRange", {
          field: t(`fields.${error.field}` as const),
        });
      case "badStep":
        return t("error.badStep", {
          field: t(`fields.${error.field}` as const),
        });
      case "badField":
        return t("error.badField", {
          field: t(`fields.${error.field}` as const),
        });
    }
  }

  const isEmpty = input.trim() === "";
  const explanation = result.ok ? explain(result.fields) : null;
  const message = result.ok
    ? explanation
    : isEmpty
      ? null
      : errorMessage(result.error);

  return (
    <div className="grid gap-4">
      <label htmlFor={inputId} className="grid gap-1.5 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("label")}
        </span>
        <Input
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode="text"
          placeholder={t("placeholder")}
          aria-invalid={!result.ok && !isEmpty}
          aria-describedby={regionId}
        />
      </label>

      <div className="grid gap-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("explanationLabel")}
        </span>
        <div
          id={regionId}
          aria-live="polite"
          className={cn(
            "min-h-9 rounded-md border px-3 py-3 text-sm leading-6 wrap-break-word",
            result.ok
              ? "border-border bg-card/40 text-foreground"
              : isEmpty
                ? "border-border bg-card/40 text-muted-foreground"
                : "border-destructive/40 bg-destructive/5 text-destructive",
          )}
        >
          {message ?? tc("emptyHint")}
        </div>
        {result.ok && explanation ? (
          <div className="flex justify-end">
            <CopyButton value={explanation} label={t("copyNoun")}>
              {tc("copy")}
            </CopyButton>
          </div>
        ) : null}
      </div>

      {result.ok ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {FIELD_ORDER.map((name) => {
            const field = result.fields[name];
            if (!field) return null;
            return (
              <li
                key={name}
                className="grid min-w-0 gap-1 rounded-md border border-border bg-card/40 p-2"
              >
                <span className="truncate font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {t(`fields.${name}` as const)}
                </span>
                <code className="truncate font-mono text-sm text-foreground">
                  {field.raw}
                </code>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="grid gap-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("presetsLabel")}
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ key, cron }) => (
            <button
              key={cron}
              type="button"
              onClick={() => setInput(cron)}
              aria-pressed={input.trim() === cron}
              className={cn(
                "min-h-9 rounded-md border border-border bg-card/40 px-2.5 py-1 text-left font-mono text-xs text-muted-foreground",
                "motion-safe:transition-colors hover:border-ring/40 hover:text-foreground",
                "aria-pressed:border-ring/60 aria-pressed:text-foreground",
                FOCUS_RING,
              )}
            >
              {t(`presets.${key}` as const)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
