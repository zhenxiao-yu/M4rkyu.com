import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Post } from "@/content/schemas";

interface PostListItemProps {
  post: Post;
}

const monoMeta =
  "font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground";

/**
 * Single timeline row for /blog. The whole row is one Link — no
 * nested interactive elements. Mono date column on md+; on mobile,
 * date and reading time co-locate on a single meta line above the
 * title. Hover lifts background subtly; no scale, no shadow.
 */
export function PostListItem({ post }: PostListItemProps) {
  const isDraft = post.status !== "ready";
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "group grid gap-3 rounded-lg border border-transparent px-4 py-5 transition-colors duration-[var(--motion-fast)] ease-[var(--ease-premium)]",
          "hover:border-border hover:bg-muted/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "md:grid-cols-[8rem_1fr_auto] md:items-baseline md:gap-6",
        )}
      >
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
          </div>
          <h3 className="text-lg font-semibold leading-snug text-foreground">
            {post.title}
            <ArrowUpRight
              aria-hidden="true"
              className="ml-1 inline size-4 -translate-y-0.5 text-muted-foreground transition-transform duration-[var(--motion-fast)] group-hover:-translate-y-1.5 group-hover:translate-x-0.5 group-hover:text-foreground"
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
        <span className={cn(monoMeta, "hidden shrink-0 md:inline md:text-right")}>
          {post.readingTime}
        </span>
      </Link>
    </li>
  );
}
