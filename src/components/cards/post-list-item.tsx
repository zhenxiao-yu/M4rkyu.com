import { ArrowUpRight, Heart, MessageSquare } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { LinkPreview } from "@/components/system/link-preview";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Post } from "@/content/schemas";
import type { ReactNode } from "react";

interface PostListItemProps {
  post: Post;
}

const monoMeta =
  "font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground";

/**
 * Always routes to the in-site `/logs/[slug]` detail page (Phase
 * 8.2). Syndicated posts now render in-site with a "View on dev.to"
 * affordance inside the post header, so we no longer link out from
 * the timeline.
 */
function RowLink({
  post,
  className,
  children,
}: {
  post: Post;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link href={`/logs/${post.slug}`} className={className}>
      {children}
    </Link>
  );
}

/**
 * Single timeline row for /blog. The row is a single Link — no
 * nested interactive elements. The outer `<li>` is intentionally
 * NOT included here so the consumer can wrap with `<StaggerItem
 * as="li">` for the timeline filter restagger orchestration.
 *
 * Layout:
 * - <md: date + reading time stack on a single meta line above the title.
 * - md: 3-col grid → mono-date column · content · reading time.
 * - lg + cover: 4-col grid → 4:3 thumbnail · date · content · reading time.
 *
 * Hover lifts the background subtly; the `LinkPreview` tooltip
 * surfaces the full cover + lede on desktop.
 */
export function PostListItem({ post }: PostListItemProps) {
  const isDraft = post.status !== "ready";
  const hasCover = Boolean(post.coverImage);
  return (
    <LinkPreview
      title={post.title}
      lede={post.excerpt}
      eyebrow={post.category}
      image={post.coverImage}
      placeholderLabel="POST COVER TBD"
      side="right"
      align="start"
    >
      <RowLink
        post={post}
        className={cn(
          "group grid gap-3 rounded-lg border border-transparent px-4 py-5 transition-colors duration-(--motion-fast) ease-(--ease-premium)",
          "hover:border-border hover:bg-muted/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "md:items-center md:gap-6",
          hasCover
            ? "md:grid-cols-[8rem_1fr_auto] lg:grid-cols-[8rem_8rem_1fr_auto]"
            : "md:grid-cols-[8rem_1fr_auto]",
        )}
      >
        {/* lg-only thumbnail (only when a cover exists). Hidden on
         * mobile / md to keep the timeline text-first; on lg the row
         * reads as a contact sheet. */}
        {hasCover && post.coverImage ? (
          <div
            aria-hidden="true"
            className="relative hidden aspect-4/3 w-32 overflow-hidden rounded-md border border-border bg-muted lg:block"
          >
            <Image
              src={post.coverImage.src}
              alt=""
              fill
              sizes="128px"
              className="object-cover grayscale transition duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
            />
          </div>
        ) : null}

        {/* Mobile-only meta line: date · reading time */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1",
            "md:hidden",
          )}
        >
          <span className={monoMeta}>{post.date}</span>
          <span aria-hidden="true" className="text-muted-foreground/40">
            ·
          </span>
          <span className={monoMeta}>{post.readingTime}</span>
        </div>

        {/* Desktop-only: standalone date column */}
        <span className={cn(monoMeta, "hidden md:inline")}>{post.date}</span>

        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={monoMeta}>{post.category}</span>
            {isDraft ? <DraftBadge label={post.status} /> : null}
            {post.reactionsCount > 0 || post.commentsCount > 0 ? (
              <span
                className={cn(
                  monoMeta,
                  "ml-auto flex items-center gap-2.5 normal-case",
                )}
              >
                {post.reactionsCount > 0 ? (
                  <span
                    className="flex items-center gap-1"
                    aria-label={`${post.reactionsCount} reactions on dev.to`}
                  >
                    <Heart aria-hidden="true" className="size-3" />
                    {post.reactionsCount}
                  </span>
                ) : null}
                {post.commentsCount > 0 ? (
                  <span
                    className="flex items-center gap-1"
                    aria-label={`${post.commentsCount} comments on dev.to`}
                  >
                    <MessageSquare aria-hidden="true" className="size-3" />
                    {post.commentsCount}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold leading-snug text-foreground">
            {post.title}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-1 inline size-4 -translate-y-0.5 text-muted-foreground transition-transform duration-(--motion-fast) group-hover:-translate-y-1.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>
          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
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
        </div>

        {/* Desktop-only: reading time, right-aligned */}
        <span
          className={cn(
            monoMeta,
            "hidden shrink-0 md:inline md:text-right",
          )}
        >
          {post.readingTime}
        </span>
      </RowLink>
    </LinkPreview>
  );
}
