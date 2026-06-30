"use client";

import { Check, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SaveState } from "./use-autosave-field";

export function SaveStatus({
  status,
  className,
}: {
  status: SaveState;
  className?: string;
}) {
  const t = useTranslations("Admin");
  if (status === "idle") return null;
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]",
        status === "error" ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      {status === "saving" ? (
        <>
          <Loader2 aria-hidden="true" className="size-3 animate-spin" />
          {t("autosave.saving")}
        </>
      ) : null}
      {status === "saved" ? (
        <>
          <Check aria-hidden="true" className="size-3" />
          {t("autosave.saved")}
        </>
      ) : null}
      {status === "error" ? (
        <>
          <RotateCcw aria-hidden="true" className="size-3" />
          {t("autosave.retry")}
        </>
      ) : null}
    </span>
  );
}
