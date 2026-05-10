import { ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import type { Post } from "@/content/schemas";

interface PinnedPostCardProps {
  post: Post;
}

const cardClass =
  "group relative block overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const bodyClass = "grid gap-4 p-6 sm:p-8";

/**
 * One-per-site pinned essay slot at the top of /blog. Uses the
 * display family for the title; otherwise reads the same data shape
 * as PostListItem. Routes to the in-site `/blog/[slug]` detail
 * route — Phase 8.2 ships in-site rendering for syndicated posts.
 *
 * When `coverImage` is set, the card grows a 16:10 hero above the
 * meta row (mirrors `ProjectCard` rest/hover treatment).
 */
export async function PinnedPostCard({ post }: PinnedPostCardProps) {
  const t = await getTranslations("Blog");
  const isDraft = post.status !== "ready";

  const cover = post.coverImage ? (
    <div className="relative aspect-16/10 overflow-hidden border-b bg-muted">
      <Image
        src={post.coverImage.src}
        alt={post.coverImage.alt}
        fill
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover grayscale transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0"
      />
    </div>
  ) : null;

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.24em] text-signal">
          <Star aria-hidden="true" className="size-3 fill-current" />
          {t("pinnedEyebrow")}
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {post.category}
        </span>
        {isDraft ? <DraftBadge label={post.status} /> : null}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-balance sm:text-3xl">
        {post.title}
        <ArrowUpRight
          aria-hidden="true"
          className="ml-2 inline size-5 -translate-y-1 text-muted-foreground transition-transform duration-(--motion-fast) group-hover:-translate-y-2 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </h3>
      <p className="max-w-2xl text-base leading-7 text-muted-foreground">
        {post.excerpt}
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {post.date} · {post.readingTime}
        </span>
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
    </>
  );

  return (
    <Link href={`/blog/${post.slug}`} className={cardClass}>
      {cover}
      <div className={bodyClass}>{body}</div>
    </Link>
  );
}
