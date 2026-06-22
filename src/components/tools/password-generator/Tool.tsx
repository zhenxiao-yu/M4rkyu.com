"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { Button } from "@/components/ui/button";
import {
  cryptoRandomInt,
  generatePassword,
  hasUsablePool,
  PASSWORD_CLASSES,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  scoreStrength,
  type PasswordClass,
  type PasswordOptions,
} from "@/lib/tools/password";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const DEFAULT_LENGTH = 20;

const DEFAULT_CLASSES: Record<PasswordClass, boolean> = {
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
};

// Browser-backed unbiased RNG, created once. The tool is mounted client-only
// (dynamic ssr:false in tool-renderer), so crypto.getRandomValues is always
// available and the lazy initial-state generation below can't mismatch
// hydration.
const randomInt = cryptoRandomInt((array) => crypto.getRandomValues(array));

const STRENGTH_TONE = {
  weak: "text-destructive",
  fair: "text-warning",
  good: "text-success",
  strong: "text-success",
} as const;

const STRENGTH_BAR = {
  weak: "bg-destructive",
  fair: "bg-warning",
  good: "bg-success",
  strong: "bg-success",
} as const;

export function PasswordGenerator() {
  const t = useTranslations("Tools.passwordGenerator");
  const tc = useTranslations("Tools.common");

  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [classes, setClasses] = useState<Record<PasswordClass, boolean>>(DEFAULT_CLASSES);
  const [noAmbiguous, setNoAmbiguous] = useState(false);

  const buildOptions = (
    next: { length?: number; classes?: Record<PasswordClass, boolean>; noAmbiguous?: boolean } = {},
  ): PasswordOptions => {
    const c = next.classes ?? classes;
    return {
      length: next.length ?? length,
      lower: c.lower,
      upper: c.upper,
      digits: c.digits,
      symbols: c.symbols,
      noAmbiguous: next.noAmbiguous ?? noAmbiguous,
    };
  };

  // Lazy first password — computed once on mount, client-only (no SSR), so it
  // never causes a hydration mismatch and never recomputes on re-render.
  const [password, setPassword] = useState(() =>
    generatePassword(buildOptions(), randomInt),
  );

  const options = buildOptions();
  const usable = hasUsablePool(options);
  const strength = scoreStrength(password);
  const strengthLabel = t(`strength.${strength.level}`);

  // The single regeneration path: every caller funnels here so generation is
  // deliberate (action or option change), never per render. Guards an empty
  // pool so a disabled-everything state can never emit a garbage string.
  function regenerate(opts: PasswordOptions) {
    if (!hasUsablePool(opts)) return;
    setPassword(generatePassword(opts, randomInt));
  }

  function changeLength(value: number) {
    setLength(value);
    regenerate(buildOptions({ length: value }));
  }

  function toggleClass(key: PasswordClass) {
    const nextClasses = { ...classes, [key]: !classes[key] };
    setClasses(nextClasses);
    regenerate(buildOptions({ classes: nextClasses }));
  }

  function toggleAmbiguous() {
    const next = !noAmbiguous;
    setNoAmbiguous(next);
    regenerate(buildOptions({ noAmbiguous: next }));
  }

  return (
    <div className="grid gap-4">
      {/* Output */}
      <div className="grid gap-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {tc("output")}
        </span>
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/40 p-2">
          <code
            className="min-w-0 flex-1 break-all font-mono text-sm"
            aria-live="polite"
            aria-label={t("passwordAria")}
          >
            {password || "—"}
          </code>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => regenerate(options)}
              disabled={!usable}
              aria-label={tc("generate")}
              className="w-9 px-0"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
            </Button>
            <CopyButton value={password} label="password" disabled={!password} />
          </div>
        </div>
      </div>

      {/* Strength */}
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs">
          <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">
            {t("strengthLabel")}{" "}
            <span className={cn("font-medium", STRENGTH_TONE[strength.level])}>
              {strengthLabel}
            </span>
          </span>
          <span className="font-mono tabular-nums text-muted-foreground">
            {t("chars", { count: password.length })}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength.pct}
          aria-label={t("strengthMeterAria", { level: strengthLabel })}
        >
          <div
            className={cn(
              "h-full rounded-full motion-safe:transition-[width] motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
              STRENGTH_BAR[strength.level],
            )}
            style={{ width: `${password ? Math.max(strength.pct, 4) : 0}%` }}
          />
        </div>
      </div>

      {/* Length */}
      <div className="grid gap-1.5">
        <label
          htmlFor="pw-length"
          className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <span>{t("length")}</span>
          <span className="tabular-nums text-foreground">{length}</span>
        </label>
        <input
          id="pw-length"
          type="range"
          min={PASSWORD_MIN_LENGTH}
          max={PASSWORD_MAX_LENGTH}
          value={length}
          onChange={(e) =>
            changeLength(
              clampInt(e.target.value, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, DEFAULT_LENGTH),
            )
          }
          className={cn(
            "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring",
            FOCUS_RING_INSET,
          )}
        />
      </div>

      {/* Classes */}
      <fieldset className="grid gap-1.5">
        <legend className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("classesLegend")}
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PASSWORD_CLASSES.map((key) => (
            <Toggle
              key={key}
              id={`pw-class-${key}`}
              label={t(`classLabel.${key}`)}
              hint={t(`classHint.${key}`)}
              checked={classes[key]}
              onChange={() => toggleClass(key)}
            />
          ))}
          <Toggle
            id="pw-no-ambiguous"
            label={t("noAmbiguousLabel")}
            hint={t("noAmbiguousHint")}
            checked={noAmbiguous}
            onChange={toggleAmbiguous}
          />
        </div>
        {!usable ? (
          <p role="alert" className="font-mono text-xs text-destructive">
            {t("noClassHint")}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      title={hint}
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-background/40 px-3 py-2",
        "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
        "hover:bg-background/70 has-focus-visible:ring-2 has-focus-visible:ring-ring",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-describedby={`${id}-hint`}
        className="size-4 shrink-0 rounded border-border accent-ring focus-visible:outline-none"
      />
      <span className="min-w-0 truncate font-mono text-xs">{label}</span>
      <span id={`${id}-hint`} className="sr-only">
        {hint}
      </span>
    </label>
  );
}
