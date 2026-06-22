"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { Input } from "@/components/ui/input";
import { fromRoman, toRoman, ROMAN_MAX, ROMAN_MIN } from "@/lib/tools/roman";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

export function RomanNumeral() {
  const t = useTranslations("Tools.roman");
  const tc = useTranslations("Tools.common");
  const fieldId = useId();

  // Raw input strings so each field stays freely editable (transient empty /
  // partial values). The converse field is only rewritten when the edited side
  // parses cleanly, so a typo never silently corrupts the other input.
  const [arabicDraft, setArabicDraft] = useState("2026");
  const [romanDraft, setRomanDraft] = useState("MMXXVI");

  function handleArabic(raw: string) {
    setArabicDraft(raw);
    if (raw.trim() === "") return;
    const n = Number(raw);
    const r = Number.isInteger(n) ? toRoman(n) : null;
    if (r !== null) setRomanDraft(r);
  }

  function handleRoman(raw: string) {
    setRomanDraft(raw);
    if (raw.trim() === "") return;
    const n = fromRoman(raw);
    if (n !== null) setArabicDraft(String(n));
  }

  const arabicId = `${fieldId}-arabic`;
  const romanId = `${fieldId}-roman`;

  // Three distinct states per field: empty (valid-empty), valid, error.
  const arabicEmpty = arabicDraft.trim() === "";
  const romanEmpty = romanDraft.trim() === "";
  // toRoman doubles as the range/integer guard for the numeric side.
  const arabicError = !arabicEmpty && toRoman(Number(arabicDraft)) === null;
  const romanError = !romanEmpty && fromRoman(romanDraft) === null;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id={arabicId}
          label={t("arabicLabel")}
          ariaLabel={t("arabicAria")}
          value={arabicDraft}
          empty={arabicEmpty}
          error={arabicError}
          errorMessage={t("rangeHint", { min: ROMAN_MIN, max: ROMAN_MAX })}
          inputMode="numeric"
          copyLabel={t("arabicLabel")}
          onChange={handleArabic}
          onBlur={() => {
            // Snap a stray / out-of-range whole number back into [1, 3999] on
            // blur so the field self-heals instead of resting on an error.
            if (arabicError && /^-?\d+$/.test(arabicDraft.trim())) {
              handleArabic(
                String(clampInt(arabicDraft, ROMAN_MIN, ROMAN_MAX, ROMAN_MIN)),
              );
            }
          }}
        />
        <Field
          id={romanId}
          label={t("romanLabel")}
          ariaLabel={t("romanAria")}
          value={romanDraft}
          empty={romanEmpty}
          error={romanError}
          errorMessage={t("invalidNumeral")}
          copyLabel={t("romanLabel")}
          onChange={handleRoman}
        />
      </div>

      {arabicEmpty && romanEmpty ? (
        <div className="grid place-items-center gap-1 rounded-md border border-dashed border-border bg-card/40 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">{tc("empty")}</p>
          <p className="text-xs text-muted-foreground/70">{tc("emptyHint")}</p>
        </div>
      ) : null}

      <p className="text-[0.65rem] text-muted-foreground/70">{t("note")}</p>
    </div>
  );
}

function Field({
  id,
  label,
  ariaLabel,
  value,
  empty,
  error,
  errorMessage,
  inputMode,
  copyLabel,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  ariaLabel: string;
  value: string;
  empty: boolean;
  error: boolean;
  errorMessage: string;
  inputMode?: "numeric";
  copyLabel: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="grid min-w-0 gap-1.5">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        <span className="min-w-0 truncate">{label}</span>
        {error ? (
          <span
            id={errorId}
            role="alert"
            className="min-w-0 shrink truncate normal-case text-destructive"
          >
            {errorMessage}
          </span>
        ) : null}
      </label>
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          inputMode={inputMode}
          aria-label={ariaLabel}
          aria-invalid={error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "min-w-0 flex-1 break-all font-mono text-lg",
            FOCUS_RING_INSET,
            error && "border-destructive/50",
          )}
        />
        <CopyButton
          value={value}
          label={copyLabel}
          disabled={empty || error}
          className="size-9 shrink-0 px-0"
        />
      </div>
    </div>
  );
}
