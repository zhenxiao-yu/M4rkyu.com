"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/social/copy-to-clipboard";

/**
 * Copy-to-clipboard for the tools workbench. Wraps the shared
 * `copyToClipboard` helper (guards a missing API + toasts on failure) and
 * adds a transient `copied` flag so buttons can flip Copy → Check. Toast
 * strings come from the localized `Tools.common` namespace, so every tool
 * gets consistent, translated feedback instead of ad-hoc inline handlers
 * (several of which had no `.catch` and threw on failure).
 */
export function useCopy(resetMs = 1500) {
  const t = useTranslations("Tools.common");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string, label?: string) => {
      const ok = await copyToClipboard(text, {
        success: label ? t("copiedLabel", { label }) : t("copied"),
        error: t("copyFailed"),
      });
      if (ok) {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
      }
      return ok;
    },
    [t, resetMs],
  );

  return { copied, copy };
}
