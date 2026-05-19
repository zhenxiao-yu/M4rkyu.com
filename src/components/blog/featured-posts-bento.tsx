"use client";

import Image from "next/image";
import { ArrowUpRight, Heart, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BentoCard, BentoGrid } from "@/components/ui/magic/bento-grid";
import { BentoTilt } from "@/components/ui/magic/bento-tilt";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { BLOG_PAGE_SETTINGS } from "@/content/blog-page";
import type { Post } from "@/content/schemas";
import { Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";

interface FeaturedPostsBentoProps {
  posts: Post[];
  heading: string;
  description: string;
  ctaLabel: string;
}

/**
 * @deprecated Replaced by `FeaturedPostsRotator` on /logs as of the
 * mosaic-bento revamp. Left on disk in case the static surface is
 * needed elsewhere; no callers remain in the app tree.
 */

const metaClass =
  "font-mono text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground";

export function FeaturedPostsBento({
  posts,
  heading,
  description,
  ctaLabel,
}: FeaturedPostsBentoProps) {
  const featured = posts.slice(0, BLOG_PAGE_SETTINGS.featuredPostCount);
  if (featured.length === 0) return null;

  const [lead, ...secondary] = featured;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <span className="w-fit rounded-full border border-border bg-background/70 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          F0{featured.length}
        </span>
      </div>

      <BentoGrid className="auto-rows-[15rem] sm:auto-rows-[14rem] lg:auto-rows-[13.5rem]">
        {lead ? (
          <FeaturedPostCard
            post={lead}
            priority
            ctaLabel={ctaLabel}
            span="sm:col-span-2 lg:row-span-2"
            emphasis="lead"
          />
        ) : null}
        {secondary.map((post, index) => (
          <FeaturedPostCard
            key={post.slug}
            post={post}
            priority={index === 0}
            ctaLabel={ctaLabel}
          />
        ))}
      </BentoGrid>
    </div>
  );
}

function FeaturedPostCard({
  post,
  priority = false,
  ctaLabel,
  span,
  emphasis = "supporting",
}: {
  post: Post;
  priority?: boolean;
  ctaLabel: string;
  span?: string;
  emphasis?: "lead" | "supporting";
}) {
  const isLead = emphasis === "lead";
  const isDraft = post.status !== "ready";
  const cover = post.coverImage;

  return (
    <BentoTilt className={cn("h-full", span)}>
      <BentoCard
        span="h-full"
        className={cn(
          "isolate min-h-0 rounded-lg bg-card shadow-lg shadow-black/5 transition-[border-color,box-shadow,transform] duration-(--motion-medium) hover:shadow-xl hover:shadow-black/10 dark:shadow-black/30",
          isLead && "border-ring/35",
        )}
      >
        {isLead ? (
          <ShineBorder
            borderRadius={8}
            duration={18}
            shineColor="var(--ring)"
          />
        ) : null}
        <Link
          href={`/logs/${post.slug}`}
          className={cn(
            "group relative flex h-full flex-col justify-end overflow-hidden p-4 sm:p-5",
            FOCUS_RING,
          )}
        >
          <div className="absolute inset-0 -z-20 bg-muted" aria-hidden="true">
            {cover ? (
              <Image
                src={cover.src}
                alt=""
                fill
                loading={priority ? "eager" : "lazy"}
                sizes={
                  isLead
                    ? "(min-width: 1024px) 66vw, 100vw"
                    : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                }
                className="object-cover grayscale transition duration-300 ease-(--ease-premium) group-hover:scale-[1.035] group-hover:grayscale-0"
              />
            ) : (
              <PlaceholderImage
                label="POST COVER TBD"
                aspect="h-full"
                className="rounded-none border-0"
              />
            )}
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/72 to-background/10"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-linear-to-b from-background/55 to-transparent"
          />

          <div className="mb-auto flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/75 px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-foreground backdrop-blur">
              <Sparkles aria-hidden="true" className="size-3 text-ring" />
              {post.category}
            </span>
            {isDraft ? <DraftBadge label={post.status} /> : null}
          </div>

          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={metaClass}>{post.date}</span>
              <span aria-hidden="true" className="text-muted-foreground/50">
                /
              </span>
              <span className={metaClass}>{post.readingTime}</span>
            </div>
            <h3
              className={cn(
                "font-heading font-semibold leading-tight tracking-normal text-foreground text-balance",
                isLead ? "text-2xl sm:text-3xl" : "text-lg",
              )}
            >
              {post.title}
            </h3>
            {isLead ? (
              <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {post.excerpt}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {ctaLabel}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-(--motion-fast) group-hover:-translate-y-1 group-hover:translate-x-0.5"
                />
              </span>
              <span className="flex items-center gap-3 font-mono text-[0.62rem] text-muted-foreground">
                {post.reactionsCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Heart aria-hidden="true" className="size-3" />
                    {post.reactionsCount}
                  </span>
                ) : null}
                {post.commentsCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare aria-hidden="true" className="size-3" />
                    {post.commentsCount}
                  </span>
                ) : null}
              </span>
            </div>

            {post.tags.length > 0 && isLead ? (
              <div className="hidden flex-wrap gap-1.5 sm:flex">
                {post.tags
                  .slice(0, BLOG_PAGE_SETTINGS.featuredLeadTagLimit)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-background/55 text-[0.58rem] lowercase tracking-[0.1em] backdrop-blur"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            ) : null}
          </div>
        </Link>
      </BentoCard>
    </BentoTilt>
  );
}
