import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DevtoArticleListItem } from "@/lib/blog/devto";

interface RelatedPostsProps {
  currentSlug: string;
  currentTags: readonly string[];
  articles: readonly DevtoArticleListItem[];
  limit?: number;
}

const eyebrowMono =
  "font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground";

/**
 * Pick up to `limit` articles ordered by tag-overlap with the
 * current post. Falls back to the next chronological articles
 * (newest-first) if no overlap exists. The current article is
 * always excluded.
 */
function pickRelated(
  currentSlug: string,
  currentTags: readonly string[],
  articles: readonly DevtoArticleListItem[],
  limit: number,
): DevtoArticleListItem[] {
  const others = articles.filter((article) => article.slug !== currentSlug);
  const tagSet = new Set(currentTags);
  if (tagSet.size === 0) {
    return others.slice(0, limit);
  }
  const scored = others.map((article) => ({
    article,
    score: article.tag_list.reduce(
      (count, tag) => (tagSet.has(tag) ? count + 1 : count),
      0,
    ),
  }));
  const overlapping = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.article);
  if (overlapping.length >= limit) return overlapping.slice(0, limit);
  // Pad with the most recent non-overlapping articles. dev.to lists
  // newest-first; preserve that order.
  const seen = new Set(overlapping.map((a) => a.slug));
  const filler = others
    .filter((article) => !seen.has(article.slug))
    .slice(0, limit - overlapping.length);
  return [...overlapping, ...filler];
}

/**
 * "Related" stack rendered after the post body. Reads directly off
 * the dev.to article listing (not the schema-parsed `Post[]`) so it
 * survives any per-row Zod parse failure that might drop posts from
 * the timeline. Mirrors the project-detail "Related work" card grid.
 */
export async function RelatedPosts({
  currentSlug,
  currentTags,
  articles,
  limit = 3,
}: RelatedPostsProps) {
  const t = await getTranslations("Blog");
  const related = pickRelated(currentSlug, currentTags, articles, limit);
  if (related.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-3xl border-t px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <h2 className={eyebrowMono}>{t("relatedHeading")}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {article.tag_list[0] ?? "post"}
            </p>
            <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
