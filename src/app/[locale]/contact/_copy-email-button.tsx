"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { copyToClipboard } from "@/lib/social/copy-to-clipboard";
import { cn, FOCUS_RING } from "@/lib/utils";

// Subtle copy-the-address affordance shown beside the "Email directly"
// mailto button so a visitor can grab the address without opening a
// mail client. Reuses the shared clipboard helper + Social toast strings.
export function CopyEmailButton({ email }: { email: string }) {
  const t = useTranslations("Social");

  return (
    <button
      type="button"
      aria-label={t("copyEmail")}
      title={t("copyEmail")}
      onClick={() =>
        copyToClipboard(email, {
          success: t("emailCopied"),
          error: t("sharingUnavailable"),
        })
      }
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
        "hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5",
        FOCUS_RING,
      )}
    >
      <Copy className="size-4" aria-hidden="true" />
    </button>
  );
}
