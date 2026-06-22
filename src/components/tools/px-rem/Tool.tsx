"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampNumber, parseFloatSafe } from "@/components/tools/_shared/number";
import { Input } from "@/components/ui/input";
import { DEFAULT_BASE, pxToRem, remToPx } from "@/lib/tools/px-rem";
import { cn } from "@/lib/utils";

const LADDER = [12, 14, 16, 20, 24, 32, 48];
const MAX_BASE = 200;

// Trim trailing zeros so output reads like hand-written CSS (1.5rem, not
// 1.5000rem) while still keeping precision for odd bases.
function trim(n: number, dp = 4): string {
  if (!Number.isFinite(n)) return "0";
  return Number(n.toFixed(dp)).toString();
}

function tailwindFor(rem: number): string {
  const map: Record<number, string> = {
    0.75: "text-xs",
    0.875: "text-sm",
    1: "text-base",
    1.25: "text-xl",
    1.5: "text-2xl",
    2: "text-4xl",
    3: "text-5xl",
  };
  return map[rem] ?? `[font-size:${trim(rem)}rem]`;
}

export function PxRemConverter() {
  // Tool-specific strings here; the shared copy strings (copy / copied /
  // copyFailed) come from Tools.common via CopyButton.
  const t = useTranslations("Tools.pxRem");
  const ids = useId();

  // String drafts so the user can type freely (empty, "1.", "-") mid-edit
  // without the value snapping or rendering NaN.
  const [baseDraft, setBaseDraft] = useState("16");
  const [pxDraft, setPxDraft] = useState("24");
  const [remDraft, setRemDraft] = useState("1.5");

  // Parsed base: empty/invalid → 0, which the conversion helpers treat as the
  // 16px CSS default (no divide-by-zero → Infinity/NaN). The hint surfaces the
  // fallback so the math is never silently wrong.
  const rawBase = clampNumber(parseFloatSafe(baseDraft, 0), 0, MAX_BASE);
  const baseFellBack = !(rawBase > 0);
  const effectiveBase = baseFellBack ? DEFAULT_BASE : rawBase;

  const px = parseFloatSafe(pxDraft, 0);
  const rem = parseFloatSafe(remDraft, 0);

  function onPxChange(raw: string) {
    setPxDraft(raw);
    setRemDraft(trim(pxToRem(parseFloatSafe(raw, 0), effectiveBase)));
  }

  function onRemChange(raw: string) {
    setRemDraft(raw);
    setPxDraft(trim(remToPx(parseFloatSafe(raw, 0), effectiveBase)));
  }

  function onBaseChange(raw: string) {
    setBaseDraft(raw);
    // Keep px the anchor and re-derive rem against the new base, so changing
    // the root size updates the dependent field instead of going stale.
    const nextBase = clampNumber(parseFloatSafe(raw, 0), 0, MAX_BASE);
    setRemDraft(trim(pxToRem(parseFloatSafe(pxDraft, 0), nextBase || DEFAULT_BASE)));
  }

  const pxValue = trim(remToPx(rem, effectiveBase));
  const remValue = trim(pxToRem(px, effectiveBase));

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end gap-2 min-w-0">
        <NumberField
          id={`${ids}-px`}
          label={t("pixels")}
          suffix="px"
          value={pxDraft}
          onChange={onPxChange}
          copyValue={`${remValue}rem`}
          copyLabel={t("rem")}
        />
        <NumberField
          id={`${ids}-rem`}
          label={t("rem")}
          suffix="rem"
          value={remDraft}
          onChange={onRemChange}
          copyValue={`${pxValue}px`}
          copyLabel={t("pixels")}
        />
        <NumberField
          id={`${ids}-base`}
          label={t("base")}
          suffix="px"
          value={baseDraft}
          onChange={onBaseChange}
          invalid={baseFellBack}
        />
      </div>

      <p
        className={cn(
          "font-mono text-[0.65rem] leading-relaxed",
          baseFellBack ? "text-warning" : "text-muted-foreground",
        )}
      >
        {baseFellBack ? t("baseFallback", { base: DEFAULT_BASE }) : t("baseNote")}
      </p>

      <div className="grid gap-2 rounded-md border border-border bg-card/40 p-3 min-w-0">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("ladderTitle", { base: trim(effectiveBase) })}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-2 py-1 text-left font-mono font-normal">px</th>
                <th className="px-2 py-1 text-left font-mono font-normal">rem</th>
                <th className="px-2 py-1 text-left font-mono font-normal">
                  {t("ladderTailwind")}
                </th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {LADDER.map((v) => {
                const r = pxToRem(v, effectiveBase);
                return (
                  <tr key={v} className="border-t border-border/40">
                    <td className="px-2 py-1">{v}</td>
                    <td className="px-2 py-1">{trim(r)}rem</td>
                    <td className="px-2 py-1 text-muted-foreground">
                      {tailwindFor(r)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  suffix,
  value,
  onChange,
  copyValue,
  copyLabel,
  invalid,
}: {
  id: string;
  label: string;
  suffix: string;
  value: string;
  onChange: (raw: string) => void;
  copyValue?: string;
  copyLabel?: string;
  invalid?: boolean;
}) {
  return (
    <div className="grid min-w-30 flex-1 gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative min-w-0 flex-1">
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-invalid={invalid || undefined}
            className={cn(
              "min-w-0 pr-10 font-mono tabular-nums motion-safe:transition-colors",
              invalid && "border-warning/60",
            )}
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground"
            aria-hidden="true"
          >
            {suffix}
          </span>
        </div>
        {copyValue !== undefined ? (
          <CopyButton
            value={copyValue}
            label={copyLabel}
            className="size-9 shrink-0 px-0 motion-safe:transition-colors"
          />
        ) : null}
      </div>
    </div>
  );
}
