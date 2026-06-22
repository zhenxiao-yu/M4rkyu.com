"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn } from "@/lib/utils";
import {
  fieldsFromDateString,
  fieldsFromEpoch,
  formatRelative,
  type TimestampFields,
  type TimestampResult,
} from "@/lib/tools/timestamp";

// Two-way Unix ↔ date converter. Edit either field and the full breakdown
// (UTC / Local / ISO / millis / seconds / relative) updates live. All
// conversion + the relative-time math is pure and unit-tested in
// @/lib/tools/timestamp — this component is presentation + state only.
//
// The relative line is the only value derived from the live clock, so it's
// computed in render against a 1s-ticking `now`; everything else is a pure
// function of the input string.

export function TimestampConverter() {
  const t = useTranslations("Tools.timestamp");
  const tc = useTranslations("Tools.common");
  const locale = useLocale();

  const [unix, setUnix] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [iso, setIso] = useState(() => new Date().toISOString().slice(0, 19));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fromUnix = fieldsFromEpoch(unix);
  const fromIso = fieldsFromDateString(iso);

  function useNow() {
    const ms = Date.now();
    setUnix(Math.floor(ms / 1000).toString());
    setIso(new Date(ms).toISOString().slice(0, 19));
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-border bg-card/40 px-3 py-2 text-sm min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          <Clock className="size-3" aria-hidden="true" />
          {t("now")}
        </span>
        <code className="font-mono text-xs tabular-nums break-all">
          {Math.floor(now / 1000)}
        </code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={useNow}
          className="ml-auto h-9"
        >
          {t("useNow")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Pane title={t("unixToDate")}>
          <Field
            label={t("unixInput")}
            value={unix}
            onChange={(v) => setUnix(v.trim())}
            placeholder="1700000000"
            inputMode="numeric"
          />
          <Readout result={fromUnix} now={now} locale={locale} t={t} tc={tc} />
        </Pane>

        <Pane title={t("dateToUnix")}>
          <Field
            label={t("dateInput")}
            value={iso}
            onChange={setIso}
            placeholder="2023-11-14T22:13:20"
          />
          <Readout result={fromIso} now={now} locale={locale} t={t} tc={tc} />
        </Pane>
      </div>
    </div>
  );
}

function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-md border border-border bg-card/40 p-4 min-w-0">
      <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="grid gap-1.5 text-sm min-w-0">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="font-mono"
      />
    </label>
  );
}

type ToolT = ReturnType<typeof useTranslations<"Tools.timestamp">>;
type CommonT = ReturnType<typeof useTranslations<"Tools.common">>;

function Readout({
  result,
  now,
  locale,
  t,
  tc,
}: {
  result: TimestampResult;
  now: number;
  locale: string;
  t: ToolT;
  tc: CommonT;
}) {
  if (!result.ok) {
    if (result.reason === "empty") {
      return (
        <p className="text-xs text-muted-foreground" role="status">
          {tc("empty")}
          <span className="block text-[0.65rem] text-muted-foreground/70">
            {tc("emptyHint")}
          </span>
        </p>
      );
    }
    return (
      <p
        className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        role="status"
      >
        {tc("invalid")}
      </p>
    );
  }

  return <Fields fields={result.fields} now={now} locale={locale} t={t} />;
}

function Fields({
  fields,
  now,
  locale,
  t,
}: {
  fields: TimestampFields;
  now: number;
  locale: string;
  t: ToolT;
}) {
  const rows: { key: string; label: string; value: string }[] = [
    { key: "utc", label: t("utc"), value: fields.utc },
    { key: "local", label: t("local"), value: fields.local },
    { key: "iso", label: t("iso"), value: fields.iso },
    { key: "millis", label: t("millis"), value: String(fields.millis) },
    { key: "seconds", label: t("seconds"), value: String(fields.seconds) },
    {
      key: "relative",
      label: t("relative"),
      value: formatRelative(fields.millis, now, locale) || "—",
    },
  ];

  return (
    <ul className="grid gap-1.5">
      {rows.map(({ key, label, value }) => (
        <li
          key={key}
          className="flex flex-wrap items-center gap-2 text-xs min-w-0"
        >
          <span className="font-mono uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </span>
          <code className={cn("flex-1 font-mono break-all", "min-w-0 basis-40")}>
            {value}
          </code>
          {key === "relative" ? null : (
            <CopyButton value={value} label={label} className="h-9 shrink-0" />
          )}
        </li>
      ))}
    </ul>
  );
}
