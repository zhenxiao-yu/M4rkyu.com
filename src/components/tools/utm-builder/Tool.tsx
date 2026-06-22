"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import { buildUtmUrl, type UtmKey } from "@/lib/tools/utm-builder";
import { cn } from "@/lib/utils";

// Field order + which params are conventionally required. Labels and hints are
// resolved per-key from the `Tools.utmBuilder.fields.<key>` message group, so
// adding a param is data-only here and a key pair in messages.
const FIELDS: { key: UtmKey; required?: boolean }[] = [
  { key: "utm_source", required: true },
  { key: "utm_medium", required: true },
  { key: "utm_campaign", required: true },
  { key: "utm_term" },
  { key: "utm_content" },
  { key: "utm_id" },
];

export function UtmBuilder() {
  const t = useTranslations("Tools.utmBuilder");
  const tc = useTranslations("Tools.common");
  const baseId = useId();

  const [base, setBase] = useState("https://m4rkyu.com/work");
  const [values, setValues] = useState<Partial<Record<UtmKey, string>>>({});

  const trimmedBase = base.trim();
  const built = useMemo(() => buildUtmUrl(base, values), [base, values]);

  // Three states: empty base (prompt), valid base (built URL), invalid base
  // (show what the user typed so they can still copy, plus a localized hint).
  const isEmpty = trimmedBase === "";
  const isInvalid = !isEmpty && !built.ok;
  const output = built.ok ? built.url : trimmedBase;
  const canCopy = output !== "";

  return (
    <div className="grid gap-4">
      <label htmlFor={`${baseId}-base`} className="grid gap-1.5 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("baseLabel")}
        </span>
        <Input
          id={`${baseId}-base`}
          type="url"
          inputMode="url"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder={t("basePlaceholder")}
          className="font-mono"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? `${baseId}-base-hint` : undefined}
        />
        {isInvalid ? (
          <span
            id={`${baseId}-base-hint`}
            className="text-xs font-normal normal-case tracking-normal text-destructive"
          >
            {t("invalidUrl")}
          </span>
        ) : null}
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, required }) => {
          const fieldId = `${baseId}-${key}`;
          return (
            <label key={key} htmlFor={fieldId} className="grid gap-1.5 text-sm">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                {t(`fields.${key}.label`)}
                {required ? (
                  <span className="text-ring" aria-hidden="true">
                    {" *"}
                  </span>
                ) : null}
              </span>
              <Input
                id={fieldId}
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [key]: e.target.value }))
                }
                placeholder={key}
                className="min-h-9 font-mono"
                spellCheck={false}
                autoComplete="off"
                aria-describedby={`${fieldId}-hint`}
              />
              <span
                id={`${fieldId}-hint`}
                className="text-xs font-normal normal-case tracking-normal text-muted-foreground"
              >
                {t(`fields.${key}.hint`)}
              </span>
            </label>
          );
        })}
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("resultLabel")}
          </span>
          <CopyButton value={output} label="URL" disabled={!canCopy} />
        </div>
        <output
          aria-label={tc("output")}
          aria-live="polite"
          className={cn(
            "block break-all rounded-md border border-border bg-card/40 px-3 py-3 font-mono text-xs leading-relaxed",
            isEmpty && "text-muted-foreground",
          )}
        >
          {isEmpty ? tc("empty") : output}
        </output>
        {isEmpty ? (
          <p className="text-xs text-muted-foreground">{tc("emptyHint")}</p>
        ) : null}
      </div>
    </div>
  );
}
