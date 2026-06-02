"use client";

import { Link2, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trackShare, type ShareChannel } from "@/lib/analytics/events";

/**
 * Copy-link + social-share row. Shares the in-site URL (not the dev.to
 * canonical) on purpose — social shares should land readers on m4rkyu.com.
 * Renders a fragment so it composes into an existing flex action row.
 */
export function ShareActions({
  url,
  title,
  surface = "post",
}: {
  url: string;
  title: string;
  /** Where the share originated, for analytics (e.g. "post", "project"). */
  surface?: string;
}) {
  const t = useTranslations("Share");

  async function copyLink() {
    if (!navigator.clipboard?.writeText) {
      toast.error(t("linkCopyFailed"));
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      trackShare(surface, "link");
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("linkCopyFailed"));
    }
  }

  function openShare(href: string, channel: ShareChannel) {
    trackShare(surface, channel);
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=540");
  }

  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const linkedinIntent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url,
  )}`;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={copyLink}>
        <Link2 aria-hidden="true" className="size-3.5" />
        {t("copyLink")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => openShare(xIntent, "x")}
      >
        <Share2 aria-hidden="true" className="size-3.5" />
        {t("shareX")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => openShare(linkedinIntent, "linkedin")}
      >
        <Share2 aria-hidden="true" className="size-3.5" />
        {t("shareLinkedin")}
      </Button>
    </>
  );
}
