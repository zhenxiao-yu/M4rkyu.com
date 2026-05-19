"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Post } from "@/content/schemas";

interface PostCardProps {
  post: Post;
  /** First N cards get high fetch priority for likely LCP candidates. */
  priority?: boolean;
}

const monoMeta =
  "font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground";

/**
 * Grid-mode post card. Equal height across rows (`h-full` flex column),
 * cover image at the top, meta+title+excerpt+tags below, footer meta
 * pinned to the bottom. Hover lifts the card; the cover desaturates
 * back to color on hover. Reduced-motion suppresses the lift.
 *
 * Pairs with `PostListItem` — the timeline picks one or the other based
 * on the user's view-mode preference. They share the same `Post` shape
 * and the same routing target so swapping never breaks deep links.
 */
export function PostCard({ post, priority = false }: PostCardProps) {
  const reduce = useReducedMotion();
  const isDraft = post.status !== "ready";
  const cover = post.coverImage;

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      // No content-visibility here — interacting with the timeline's
      // IntersectionObserver paging caused the document height to
      // keep recomputing as cards painted at real (vs estimated)
      // heights, which made scroll feel "stuck" mid-page. PAGE_SIZE
      // capping in `BlogTimeline` already keeps live-DOM cards low.
      className="relative h-full"
    >
      <Link
        href={`/logs/${post.slug}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-[border-color,box-shadow] duration-(--motion-base) ease-(--ease-premium) hover:border-ring/60 hover:shadow-lg hover:shadow-black/10",
          FOCUS_RING,
        )}
      >
        {/* Cover */}
        <div className="relative aspect-16/9 w-full overflow-hidden border-b bg-muted">
          {cover ? (
            <Image
              src={cover.src}
              alt=""
              fill
              fetchPriority={priority ? "high" : "auto"}
              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover grayscale transition duration-300 group-hover:grayscale-0 motion-safe:group-hover:scale-[1.03]"
            />
          ) : (
            <PlaceholderImage
              label="POST COVER TBD"
              aspect="h-full"
              className="rounded-none border-0"
            />
          )}
          {isDraft ? (
            <span className="absolute right-3 top-3">
              <DraftBadge label={post.status} />
            </span>
          ) : null}
        </div>

        {/* Body — flex-1 pushes the footer meta to the bottom so cards
            in the same row stay aligned regardless of excerpt length. */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <span className={monoMeta}>{post.category}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            <span className={monoMeta}>{post.date}</span>
          </div>

          <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
            {post.title}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-1 inline size-4 -translate-y-0.5 text-muted-foreground transition-transform duration-(--motion-fast) group-hover:-translate-y-1.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </h3>

          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>

          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
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

          {/* Footer meta — pinned to the bottom of the card via mt-auto. */}
          <div
            className={cn(
              monoMeta,
              "mt-auto flex items-center gap-3 border-t border-border/60 pt-3 normal-case",
            )}
          >
            <span className="tabular-nums">{post.readingTime}</span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            {post.reactionsCount > 0 ? (
              <span
                className="flex items-center gap-1"
                aria-label={`${post.reactionsCount} reactions on dev.to`}
              >
                <Heart aria-hidden="true" className="size-3" />
                <span className="tabular-nums">{post.reactionsCount}</span>
              </span>
            ) : null}
            {post.commentsCount > 0 ? (
              <span
                className="flex items-center gap-1"
                aria-label={`${post.commentsCount} comments on dev.to`}
              >
                <MessageSquare aria-hidden="true" className="size-3" />
                <span className="tabular-nums">{post.commentsCount}</span>
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
