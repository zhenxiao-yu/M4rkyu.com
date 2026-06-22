"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateLorem,
  LOREM_MIN_COUNT,
  maxForUnit,
  type LoremUnit,
} from "@/lib/tools/lorem-ipsum";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const UNITS: readonly LoremUnit[] = ["paragraphs", "sentences", "words"];
const DEFAULT_COUNT = 3;

export function LoremIpsum() {
  const t = useTranslations("Tools.loremIpsum");
  const tc = useTranslations("Tools.common");

  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  // Raw string so the field stays editable through transient empty / partial
  // values; the clamped integer is derived on demand below.
  const [countDraft, setCountDraft] = useState(String(DEFAULT_COUNT));
  const [startWithLorem, setStartWithLorem] = useState(true);
  // A nonce that changes on each reroll; folded into the memo deps so the same
  // settings still produce fresh text on demand without recomputing on render.
  const [nonce, setNonce] = useState(0);

  const max = maxForUnit(unit);
  const count = clampInt(countDraft, LOREM_MIN_COUNT, max, DEFAULT_COUNT);

  const output = useMemo(
    () => generateLorem({ count, unit, startWithLorem }),
    // nonce intentionally re-rolls the (impure) generator on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, unit, startWithLorem, nonce],
  );

  return (
    <div className="grid gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-2 min-w-0">
        <div className="grid min-w-0 gap-1.5">
          <span
            id="lorem-unit-label"
            className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("unitLabel")}
          </span>
          <div
            role="radiogroup"
            aria-labelledby="lorem-unit-label"
            className="inline-flex flex-wrap gap-0.5 rounded-md border border-border bg-card/40 p-0.5"
          >
            {UNITS.map((u) => {
              const selected = unit === u;
              return (
                <button
                  key={u}
                  role="radio"
                  type="button"
                  aria-checked={selected}
                  onClick={() => setUnit(u)}
                  className={cn(
                    "min-h-9 rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em]",
                    "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                    FOCUS_RING_INSET,
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`unit.${u}`)}
                </button>
              );
            })}
          </div>
        </div>

        <label htmlFor="lorem-count" className="grid min-w-0 gap-1.5 text-sm">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("count")}
          </span>
          <Input
            id="lorem-count"
            type="number"
            inputMode="numeric"
            min={LOREM_MIN_COUNT}
            max={max}
            value={countDraft}
            aria-label={t("countAria", { min: LOREM_MIN_COUNT, max })}
            onChange={(e) => setCountDraft(e.target.value)}
            onBlur={(e) =>
              setCountDraft(
                String(clampInt(e.target.value, LOREM_MIN_COUNT, max, DEFAULT_COUNT)),
              )
            }
            className={cn("w-24 min-w-0 font-mono", FOCUS_RING_INSET)}
          />
        </label>

        <label
          htmlFor="lorem-start"
          className={cn(
            "flex min-h-9 cursor-pointer items-center gap-2 self-end rounded-md border border-border bg-background/40 px-3 py-2 text-sm",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            "hover:bg-background/70 has-focus-visible:ring-2 has-focus-visible:ring-ring",
          )}
        >
          <input
            id="lorem-start"
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="size-4 shrink-0 rounded border-border accent-ring focus-visible:outline-none"
          />
          <span className="font-mono text-xs">{t("startWithLorem")}</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <Button
          type="button"
          size="sm"
          onClick={() => setNonce((n) => n + 1)}
          className="min-h-9"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          {tc("generate")}
        </Button>
        <CopyButton
          value={output}
          label={t("copyLabel")}
          size="sm"
          disabled={output.length === 0}
          className="ml-auto min-h-9"
        >
          {tc("copyAll")}
        </CopyButton>
      </div>

      {/* Output */}
      <textarea
        readOnly
        value={output}
        rows={12}
        aria-label={t("outputAria")}
        className={cn(
          "w-full min-w-0 resize-y rounded-md border border-border bg-card/40 px-3 py-2 text-sm leading-6 whitespace-pre-wrap",
          FOCUS_RING_INSET,
        )}
      />
      <p aria-live="polite" className="sr-only">
        {t("generatedStatus", { count, unit: t(`unit.${unit}`) })}
      </p>
    </div>
  );
}
