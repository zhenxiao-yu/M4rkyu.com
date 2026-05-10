import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PostHeaderProps {
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
  canonicalUrl: string;
  reactionsCount: number;
  commentsCount: number;
  cover?: { src: string; alt: string };
  username: string;
}

/**
 * Editorial header for a syndicated dev.to post. Same atmospheric
 * stack as case-study and game detail headers (cyber-grid + archive
 * vignette), but the meta ribbon below the title surfaces dev.to-
 * specific signals: reactions, comments, and a "view on dev.to" CTA
 * that opens the canonical source in a new tab.
 */
export function PostHeader({
  title,
  description,
  date,
  readingTime,
  tags,
  canonicalUrl,
  reactionsCount,
  commentsCount,
  cover,
  username,
}: PostHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b">
      <div
        className="absolute inset-0 bg-cyber-grid opacity-30"
        aria-hidden="true"
      />
      <div className="archive-vignette absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          syndicated · dev.to / @{username}
        </p>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>

        <dl className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Published</dt>
            <dd>{date}</dd>
          </div>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Reading time</dt>
            <dd>{readingTime}</dd>
          </div>
          {reactionsCount > 0 ? (
            <>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <Heart aria-hidden="true" className="size-3 text-signal" />
                <dt className="sr-only">Reactions</dt>
                <dd>{reactionsCount}</dd>
              </div>
            </>
          ) : null}
          {commentsCount > 0 ? (
            <>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <div className="flex items-center gap-1.5">
                <MessageSquare
                  aria-hidden="true"
                  className="size-3 text-muted-foreground"
                />
                <dt className="sr-only">Comments</dt>
                <dd>{commentsCount}</dd>
              </div>
            </>
          ) : null}
        </dl>

        {tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[0.6rem] lowercase tracking-[0.1em]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on dev.to
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          </Button>
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
                Discuss
              </a>
            </Button>
          ) : null}
        </div>

        {cover ? (
          <figure className="mt-10 overflow-hidden rounded-md border border-border">
            <Image
              src={cover.src}
              alt={cover.alt}
              width={1000}
              height={420}
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="h-auto w-full"
            />
          </figure>
        ) : null}
      </div>
    </header>
  );
}
