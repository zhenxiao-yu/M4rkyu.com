"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyCitationButton({ citation }: { citation: string }) {
  const t = useTranslations("Common");

  async function copyCitation() {
    if (!navigator.clipboard?.writeText) {
      toast.error(t("citationCopyFailed"));
      return;
    }
    try {
      await navigator.clipboard.writeText(citation);
      toast.success(t("citationCopied"));
    } catch {
      toast.error(t("citationCopyFailed"));
    }
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={copyCitation}>
      <Copy aria-hidden="true" className="size-3.5" />
      {t("copyCitation")}
    </Button>
  );
}
