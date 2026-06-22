"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { clampInt } from "@/components/tools/_shared/number";
import { generateUuids } from "@/lib/tools/uuid";
import { cn } from "@/lib/utils";

// v4 UUID batch generator. Entropy comes from crypto (native randomUUID with a
// getRandomValues fallback) — never Math.random. Count is clamped to a sane
// range so a user can't request a million rows and freeze the tab. See
// @/lib/tools/uuid for the pure, unit-tested generator.

const MIN = 1;
const MAX = 100;
const DEFAULT_COUNT = 8;

export function UuidGenerator() {
  const t = useTranslations("Tools.uuid");
  const tc = useTranslations("Tools.common");

  // Raw input string so the field stays editable (allows transient empty /
  // partial values); the clamped numeric count is derived on demand.
  const [countDraft, setCountDraft] = useState(String(DEFAULT_COUNT));
  const [values, setValues] = useState<string[]>(() =>
    generateUuids(DEFAULT_COUNT),
  );

  const count = clampInt(countDraft, MIN, MAX, DEFAULT_COUNT);

  function regenerate() {
    setValues(generateUuids(count));
  }

  const all = values.join("\n");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("count")}
          </span>
          <Input
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAX}
            value={countDraft}
            onChange={(e) => setCountDraft(e.target.value)}
            onBlur={() => setCountDraft(String(count))}
            aria-label={t("countAria", { min: MIN, max: MAX })}
            className="w-24 font-mono"
          />
        </label>
        <Button type="button" size="sm" onClick={regenerate} className="min-h-9">
          <RefreshCw
            className="size-3.5 motion-safe:transition-transform"
            aria-hidden="true"
          />
          {tc("generate")}
        </Button>
        <CopyButton
          value={all}
          label="UUIDs"
          size="sm"
          disabled={values.length === 0}
          className="ml-auto min-h-9"
        >
          {tc("copyAll")}
        </CopyButton>
      </div>

      {values.length === 0 ? (
        <div className="grid place-items-center gap-1 rounded-md border border-dashed border-border bg-card/40 px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{tc("empty")}</p>
          <p className="text-xs text-muted-foreground/70">{t("emptyHint")}</p>
        </div>
      ) : (
        <ul className="grid gap-1 rounded-md border border-border bg-card/40 p-2">
          {values.map((uuid) => (
            <li
              key={uuid}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-sm px-1.5 py-1",
                "motion-safe:transition-colors hover:bg-muted",
              )}
            >
              <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground">
                {uuid}
              </code>
              <CopyButton value={uuid} className="shrink-0" />
            </li>
          ))}
        </ul>
      )}

      <p className="text-[0.65rem] text-muted-foreground/70">{t("note")}</p>
    </div>
  );
}
