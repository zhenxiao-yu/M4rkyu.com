import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { CopyCitationButton } from "@/components/system/copy-citation-button";
import { ShareActions } from "@/components/system/share-actions";
import { Link } from "@/i18n/navigation";
import { topicSlugForTag } from "@/lib/search/topics";
import { cn, FOCUS_RING } from "@/lib/utils";

interface PostHeaderProps {
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  canonicalUrl: string;
  reactionsCount: number;
  commentsCount: number;
  username: string;
  /** In-site URL to share (drives readers to m4rkyu.com, not dev.to). */
  shareUrl: string;
}

/**
 * Editorial header for a syndicated dev.to post. Same atmospheric
 * stack as case-study and game detail headers (cyber-grid + archive
 * vignette), with a meta ribbon that surfaces date, reading time,
 * reactions, and comments. Renders a ring-color reading-progress
 * bar fixed to the bottom edge of the sticky site header.
 */
export async function PostHeader({
  title,
  description,
  date,
  readingTime,
  tags,
  canonicalUrl,
  reactionsCount,
  commentsCount,
  username,
  shareUrl,
}: PostHeaderProps) {
  const t = await getTranslations("Blog");
  const citation = `${title} — M4rkyu.com. ${canonicalUrl}`;
  return (
    <header className="relative overflow-hidden border-b">
      <ReadingProgress />
      <div
        className="absolute inset-0 bg-cyber-grid opacity-30"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          {t("syndicatedHeader", { username })}
        </p>

        <h1 className="mt-6 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>

        {/* Meta ribbon. On <sm we drop the inline `·` separators in
         * favor of a wrap-friendly chip stack so a long reading time
         * never orphans the reactions count on the next line. */}
        <dl className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:gap-x-5 sm:gap-y-2 sm:text-[0.65rem] sm:tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t("metaPublished")}</dt>
            <dd>{date}</dd>
          </div>
          <span
            aria-hidden="true"
            className="hidden text-muted-foreground/40 sm:inline"
          >
            ·
          </span>
          <div className="flex items-center gap-2">
            <dt className="sr-only">{t("metaReadingTime")}</dt>
            <dd>{readingTime}</dd>
          </div>
          {reactionsCount > 0 ? (
            <>
              <span
                aria-hidden="true"
                className="hidden text-muted-foreground/40 sm:inline"
              >
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <Heart aria-hidden="true" className="size-3 text-signal" />
                <dt className="sr-only">{t("metaReactions")}</dt>
                <dd>{reactionsCount}</dd>
              </div>
            </>
          ) : null}
          {commentsCount > 0 ? (
            <>
              <span
                aria-hidden="true"
                className="hidden text-muted-foreground/40 sm:inline"
              >
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <MessageSquare
                  aria-hidden="true"
                  className="size-3 text-muted-foreground"
                />
                <dt className="sr-only">{t("metaComments")}</dt>
                <dd>{commentsCount}</dd>
              </div>
            </>
          ) : null}
        </dl>

        {tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const badge = (
                <Badge
                  variant="outline"
                  className="text-[0.6rem] lowercase tracking-[0.1em]"
                >
                  {tag}
                </Badge>
              );
              // Linkify only tags that have a cross-domain topic hub;
              // dev.to-only tags (no catalog overlap) stay plain so they
              // never link to a 404.
              const topicSlug = topicSlugForTag(tag);
              return topicSlug ? (
                <Link
                  key={tag}
                  href={`/topics/${topicSlug}`}
                  className={cn(
                    "rounded-full transition-opacity hover:opacity-80",
                    FOCUS_RING,
                  )}
                >
                  {badge}
                </Link>
              ) : (
                <span key={tag}>{badge}</span>
              );
            })}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("viewOnDevto")}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          </Button>
          <CopyCitationButton citation={citation} />
          <ShareActions url={shareUrl} title={title} />
          {commentsCount > 0 ? (
            <Button asChild variant="ghost" size="sm">
              <a
                href={`${canonicalUrl}#comments`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare
                  aria-hidden="true"
                  className="size-3.5"
                />
                {t("discuss")}
              </a>
            </Button>
          ) : null}
        </div>

      </div>
    </header>
  );
}
