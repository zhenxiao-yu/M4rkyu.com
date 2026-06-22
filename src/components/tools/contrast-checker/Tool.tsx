"use client";

import { useId, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { contrastRatio, parseHex, rgbToHex, type RGB } from "@/lib/tools/color";
import { gradeContrast, WCAG_THRESHOLDS } from "@/lib/tools/contrast";

// WCAG contrast checker — paste two colors, see AA/AAA pass/fail for normal +
// large text. Color math + grading live in @/lib/tools/{color,contrast}
// (pure + unit-tested); this file is presentation only.

interface GradeRow {
  key: "aaNormal" | "aaaNormal" | "aaLarge" | "aaaLarge";
  level: string;
  size: string;
  threshold: number;
  pass: boolean;
}

export function ContrastChecker() {
  const t = useTranslations("Tools.contrastChecker");
  const tc = useTranslations("Tools.common");

  const [fgInput, setFgInput] = useState("#0f172a");
  const [bgInput, setBgInput] = useState("#f8fafc");

  const fg = useMemo(() => parseHex(fgInput), [fgInput]);
  const bg = useMemo(() => parseHex(bgInput), [bgInput]);

  // Ratio + the four conformance buckets, derived once per color change.
  const ratio = useMemo(
    () => (fg && bg ? contrastRatio(fg, bg) : null),
    [fg, bg],
  );
  const grades = useMemo(
    () => (ratio !== null ? gradeContrast(ratio) : null),
    [ratio],
  );

  const rows: GradeRow[] = grades
    ? [
        {
          key: "aaNormal",
          level: t("aa"),
          size: t("normalText"),
          threshold: WCAG_THRESHOLDS.aaNormal,
          pass: grades.aaNormal,
        },
        {
          key: "aaaNormal",
          level: t("aaa"),
          size: t("normalText"),
          threshold: WCAG_THRESHOLDS.aaaNormal,
          pass: grades.aaaNormal,
        },
        {
          key: "aaLarge",
          level: t("aa"),
          size: t("largeText"),
          threshold: WCAG_THRESHOLDS.aaLarge,
          pass: grades.aaLarge,
        },
        {
          key: "aaaLarge",
          level: t("aaa"),
          size: t("largeText"),
          threshold: WCAG_THRESHOLDS.aaaLarge,
          pass: grades.aaaLarge,
        },
      ]
    : [];

  // Normalized hex for the live preview / swatches. parseHex already coerces
  // shorthand + 8-digit input, so the preview stays stable while typing.
  const fgHex = fg ? rgbToHex(fg) : null;
  const bgHex = bg ? rgbToHex(bg) : null;
  const previewActive = fgHex !== null && bgHex !== null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <ColorField
          label={t("foreground")}
          value={fgInput}
          rgb={fg}
          onChange={setFgInput}
        />
        <ColorField
          label={t("background")}
          value={bgInput}
          rgb={bg}
          onChange={setBgInput}
        />
      </div>

      <div
        className="grid min-w-0 place-items-center rounded-md border border-border/60 px-4 py-10 text-center sm:px-6"
        style={
          previewActive
            ? { backgroundColor: bgHex, color: fgHex }
            : undefined
        }
      >
        {previewActive ? (
          <div className="grid min-w-0 gap-2">
            <p className="text-balance text-2xl font-semibold">
              {t("previewHeadline")}
            </p>
            <p className="text-balance text-base">{t("previewBody")}</p>
            <p className="font-mono text-xs opacity-80">{t("previewCaption")}</p>
          </div>
        ) : (
          <div className="grid gap-1 text-muted-foreground">
            <p className="text-sm font-medium">{tc("empty")}</p>
            <p className="text-xs">{t("emptyHint")}</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:items-start">
        <div className="grid gap-1 rounded-md border border-border/60 bg-background/40 p-4">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("ratio")}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-display text-3xl tabular-nums leading-none">
              {ratio !== null ? `${ratio.toFixed(2)}:1` : "—"}
            </p>
            {ratio !== null ? (
              <CopyButton
                value={`${ratio.toFixed(2)}:1`}
                label={t("ratio")}
                className="shrink-0"
              />
            ) : null}
          </div>
        </div>

        {rows.length > 0 ? (
          <ul className="grid gap-1.5">
            {rows.map((row) => (
              <li
                key={row.key}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full",
                      row.pass
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {row.pass ? (
                      <Check className="size-3" />
                    ) : (
                      <X className="size-3" />
                    )}
                  </span>
                  <span className="truncate">
                    <span className="font-medium">{row.level}</span>
                    <span className="text-muted-foreground"> · {row.size}</span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[0.6rem] normal-case tracking-normal"
                  >
                    ≥ {row.threshold}
                  </Badge>
                  <Badge variant={row.pass ? "success" : "outline"}>
                    {row.pass ? t("pass") : t("fail")}
                    <span aria-hidden="true">{row.pass ? " ✓" : " ✗"}</span>
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="grid place-items-center rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            {t("emptyHint")}
          </p>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  rgb,
  onChange,
}: {
  label: string;
  value: string;
  rgb: RGB | null;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("Tools.contrastChecker");
  const tc = useTranslations("Tools.common");
  const inputId = useId();
  const errorId = useId();
  const invalid = value.trim() !== "" && rgb === null;

  return (
    <div className="grid min-w-0 gap-2 text-xs text-muted-foreground">
      <label
        htmlFor={inputId}
        className="font-mono uppercase tracking-[0.18em]"
      >
        {label}
      </label>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          type="color"
          // Native picker needs a valid 6-digit hex; fall back to black while
          // the text field is mid-edit or invalid.
          value={rgb ? rgbToHex(rgb) : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          aria-label={t("pickerLabel", { label })}
          className={cn(
            "size-9 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5",
            FOCUS_RING_INSET,
          )}
        />
        <Input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#0f172a"
          aria-label={t("hexLabel", { label })}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          inputMode="text"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className={cn(
            "min-w-0 flex-1 basis-32 font-mono",
            invalid && "border-destructive/60",
          )}
        />
      </div>
      {invalid ? (
        <p id={errorId} className="text-destructive" role="alert">
          {tc("invalid")} — {t("invalidHint")}
        </p>
      ) : null}
    </div>
  );
}
