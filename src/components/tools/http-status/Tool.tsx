"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn } from "@/lib/utils";
import {
  HTTP_STATUSES,
  filterStatuses,
  groupByClass,
  type HttpStatusTone,
} from "@/lib/tools/http-status";

// Tone → semantic-token classes. Color is theme-scoped and never the *only*
// signal: each row also carries the class label as text (see the class Badge),
// so the tool reads for color-blind / low-vision users. No hex, no palette
// literals — all roles resolve to globals.css tokens.
const TONE_DOT: Record<HttpStatusTone, string> = {
  informational: "bg-muted-foreground/60",
  success: "bg-success",
  redirection: "bg-ring",
  clientError: "bg-warning",
  serverError: "bg-destructive",
};

const TONE_BADGE: Record<HttpStatusTone, "outline" | "success" | "warning" | "signal"> = {
  informational: "outline",
  success: "success",
  redirection: "signal",
  clientError: "warning",
  // No `destructive` Badge variant exists; warning carries the strongest
  // available alarm tone while the row dot + code keep 5xx visually distinct.
  serverError: "warning",
};

export function HttpStatus() {
  const t = useTranslations("Tools.httpStatus");
  // Tools.common is consumed transitively by CopyButton (copy / copyLabel /
  // copied toasts); this tool's own chrome lives under Tools.httpStatus.
  const [query, setQuery] = useState("");
  const searchId = useId();

  const groups = useMemo(
    () => groupByClass(filterStatuses(HTTP_STATUSES, query)),
    [query],
  );

  const isEmpty = groups.length === 0;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor={searchId} className="sr-only">
          {t("searchLabel")}
        </label>
        <Input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="font-mono"
        />
      </div>

      {isEmpty ? (
        <p
          role="status"
          className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-sm text-muted-foreground"
        >
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-5">
          {groups.map((group) => {
            const classLabel = t(`classes.${group.meta.key}`);
            return (
              <section key={group.meta.key} aria-labelledby={`${searchId}-${group.meta.key}`}>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn("size-2 shrink-0 rounded-full", TONE_DOT[group.meta.tone])}
                  />
                  <h3
                    id={`${searchId}-${group.meta.key}`}
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    {classLabel}
                  </h3>
                  <Badge variant={TONE_BADGE[group.meta.tone]} className="font-mono text-[0.55rem]">
                    {group.meta.key}
                  </Badge>
                </div>
                <ul className="grid gap-1.5">
                  {group.statuses.map((status) => (
                    <li
                      key={status.code}
                      className={cn(
                        "grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1",
                        "rounded-md border border-border bg-card/40 px-3 py-2",
                        "motion-safe:transition-colors hover:border-ring/40",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn("size-2 shrink-0 rounded-full", TONE_DOT[group.meta.tone])}
                        />
                        <code className="font-display text-lg tabular-nums sm:text-xl">
                          {status.code}
                        </code>
                      </span>
                      <div className="min-w-0">
                        <p className="wrap-break-word text-sm font-medium text-foreground">
                          {status.name}
                        </p>
                        <p className="wrap-break-word text-xs text-muted-foreground">
                          {status.description}
                        </p>
                      </div>
                      <CopyButton
                        value={String(status.code)}
                        label={String(status.code)}
                        className="size-9"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="text-[0.65rem] text-muted-foreground">{t("copyHint")}</p>
    </div>
  );
}
