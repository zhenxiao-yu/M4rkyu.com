"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import {
  ASCII_ART_DEFAULT_FILL,
  ASCII_ART_MAX_LENGTH,
  runAsciiArt,
} from "@/lib/tools/ascii-art";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

// Preset fill glyphs — a small, labelled palette so the field can't drift into
// unrenderable input while still allowing a custom single character.
const FILLS = ["█", "#", "@", "*", "+"] as const;

export function AsciiArt() {
  const t = useTranslations("Tools.asciiArt");
  const tc = useTranslations("Tools.common");

  const [text, setText] = useState("M4rkyu");
  const [fill, setFill] = useState<string>(ASCII_ART_DEFAULT_FILL);

  const { art, empty, truncated } = useMemo(
    () => runAsciiArt(text, { fill }),
    [text, fill],
  );

  return (
    <div className="grid gap-4">
      {/* Input */}
      <label htmlFor="ascii-text" className="grid min-w-0 gap-1.5 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("inputLabel")}
        </span>
        <Input
          id="ascii-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("inputPlaceholder")}
          spellCheck={false}
          maxLength={ASCII_ART_MAX_LENGTH}
          className={cn("min-w-0 font-mono", FOCUS_RING_INSET)}
        />
      </label>

      {/* Fill controls */}
      <div className="flex flex-wrap items-end gap-2 min-w-0">
        <div className="grid min-w-0 gap-1.5">
          <span
            id="ascii-fill-label"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("fillLabel")}
          </span>
          <div
            role="radiogroup"
            aria-labelledby="ascii-fill-label"
            className="inline-flex flex-wrap gap-0.5 rounded-md border border-border bg-card/40 p-0.5"
          >
            {FILLS.map((f) => {
              const selected = fill === f;
              return (
                <button
                  key={f}
                  role="radio"
                  type="button"
                  aria-checked={selected}
                  aria-label={t("fillOption", { glyph: f })}
                  onClick={() => setFill(f)}
                  className={cn(
                    "min-h-9 min-w-9 rounded-sm px-2 py-1 font-mono text-sm",
                    "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                    FOCUS_RING_INSET,
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <label htmlFor="ascii-fill-custom" className="grid min-w-0 gap-1.5 text-sm">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("customFillLabel")}
          </span>
          <Input
            id="ascii-fill-custom"
            value={fill}
            // Keep a single rendered glyph; empty resets to the default fill.
            onChange={(e) =>
              setFill(Array.from(e.target.value).at(-1) ?? ASCII_ART_DEFAULT_FILL)
            }
            aria-label={t("customFillAria")}
            className={cn("w-14 min-w-0 text-center font-mono", FOCUS_RING_INSET)}
            maxLength={2}
          />
        </label>

        <CopyButton
          value={art}
          label={t("copyLabel")}
          size="sm"
          disabled={empty}
          className="ml-auto min-h-9 self-end"
        >
          {tc("copy")}
        </CopyButton>
      </div>

      {/* Output — horizontally scrollable so wide banners never break the
          layout on narrow screens. */}
      {empty ? (
        <div className="rounded-md border border-border bg-card/40 px-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">{tc("empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tc("emptyHint")}</p>
        </div>
      ) : (
        <pre
          aria-label={t("outputAria", { text })}
          className="overflow-x-auto rounded-md border border-border bg-card/40 p-4 font-mono text-[0.6rem] leading-[0.85] text-foreground sm:text-xs sm:leading-[0.95]"
        >
          {art}
        </pre>
      )}

      {truncated ? (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {t("lengthCap", { max: ASCII_ART_MAX_LENGTH })}
        </p>
      ) : null}
    </div>
  );
}
