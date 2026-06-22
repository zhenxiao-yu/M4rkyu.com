"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import { BASES, type Base, bigIntFromBase, toBase } from "@/lib/tools/base-converter";
import { cn } from "@/lib/utils";

const NAME_KEYS: Record<Base, string> = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hex",
};

export function BaseConverter() {
  const t = useTranslations("Tools.baseConverter");
  const hintId = useId();

  const [drafts, setDrafts] = useState<Record<Base, string>>({
    2: "1010",
    8: "12",
    10: "10",
    16: "a",
  });

  function handleChange(base: Base, raw: string) {
    const next = { ...drafts, [base]: raw };
    const value = bigIntFromBase(raw, base);
    if (value !== null) {
      for (const other of BASES) {
        if (other !== base) next[other] = toBase(value, other);
      }
    }
    setDrafts(next);
  }

  return (
    <div className="grid gap-3">
      {BASES.map((base) => {
        const name = t(`name.${NAME_KEYS[base]}`);
        // Empty input is a valid-empty state, not an error.
        const valid = drafts[base] === "" || bigIntFromBase(drafts[base], base) !== null;
        const fieldHintId = `${hintId}-${base}`;
        return (
          <div key={base} className="grid gap-1.5">
            <label
              htmlFor={fieldHintId}
              className="flex items-baseline justify-between gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span className="min-w-0 truncate">
                {name} · {t("baseLabel", { base })}
              </span>
              {!valid && (
                <span id={`${fieldHintId}-error`} className="shrink-0 normal-case text-destructive">
                  {t("invalidChar")}
                </span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <Input
                id={fieldHintId}
                value={drafts[base]}
                onChange={(e) => handleChange(base, e.target.value)}
                spellCheck={false}
                inputMode={base === 10 ? "numeric" : "text"}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                aria-label={`${name} (${t("baseLabel", { base })})`}
                aria-invalid={!valid}
                aria-describedby={valid ? undefined : `${fieldHintId}-error`}
                className={cn("min-w-0 flex-1 font-mono", !valid && "border-destructive/50")}
              />
              <CopyButton value={drafts[base]} label={name} className="size-9 shrink-0 px-0" />
            </div>
          </div>
        );
      })}
      <p className="text-[0.65rem] text-muted-foreground/70">{t("note")}</p>
    </div>
  );
}
