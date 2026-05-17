"use client";

import { useEffect, useState } from "react";
import { Link as LinkIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/saves/save-button";
import { buildFrameShareUrl, shareOrCopy } from "@/lib/social/share";
import { cn } from "@/lib/utils";

interface GalleryActionsProps {
  slug: string;
  title: string;
  caption?: string;
  locale: string;
  /** Server-resolved initial state for SaveButton. */
  initialSaved: boolean;
  /** Whether the current viewer is signed in. */
  signedIn: boolean;
}

type FeedbackKind = "shared" | "copied" | "unsupported";

export function GalleryActions({
  slug,
  title,
  caption,
  locale,
  initialSaved,
  signedIn,
}: GalleryActionsProps) {
  const [feedback, setFeedback] = useState<FeedbackKind | null>(null);
  const t = useTranslations("Social");

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 2200);
    return () => window.clearTimeout(id);
  }, [feedback]);

  async function handleShare() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = buildFrameShareUrl(origin, locale, slug);
    const result = await shareOrCopy({ title, text: caption, url });
    setFeedback(result);
  }

  async function handleCopy() {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const url = buildFrameShareUrl(origin, locale, slug);
    if (!navigator.clipboard?.writeText) {
      setFeedback("unsupported");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("copied");
    } catch {
      setFeedback("unsupported");
    }
  }

  const feedbackLabel =
    feedback === "copied"
      ? t("linkCopied")
      : feedback === "shared"
        ? t("shared")
        : feedback === "unsupported"
          ? t("sharingUnavailable")
          : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SaveButton
        itemType="gallery"
        itemKey={slug}
        initialSaved={initialSaved}
        signedIn={signedIn}
        nextPath={`/${locale}/archive?frame=${slug}`}
      />

      <Button
        type="button"
        size="sm"
        variant="outline"
        aria-label={t("shareAria")}
        onClick={handleShare}
        className="gap-2"
      >
        <Share2 aria-hidden="true" className="size-4" />
        <span>{t("share")}</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-label={t("copyLinkAria")}
        onClick={handleCopy}
        className="gap-2"
      >
        <LinkIcon aria-hidden="true" className="size-4" />
        <span>{t("copyLink")}</span>
      </Button>

      <span
        aria-live="polite"
        className={cn(
          "ml-1 font-mono text-[0.65rem] uppercase tracking-[0.18em]",
          feedback === "unsupported" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {feedbackLabel ?? ""}
      </span>
    </div>
  );
}
