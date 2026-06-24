import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";
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

/** Related reading selected from the dev.to article listing. */
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
    <section className="mx-auto w-full max-w-3xl border-t border-border/70 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <h2 className={eyebrowMono}>{t("relatedHeading")}</h2>
      <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/logs/${article.slug}`}
            className={cn(
              "group grid gap-2 py-5 transition-colors duration-(--motion-fast) ease-(--ease-premium) sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-8",
              FOCUS_RING,
            )}
          >
            <div>
              <h3 className="text-base font-semibold leading-snug text-foreground decoration-ring/60 underline-offset-4 group-hover:underline">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {article.description}
              </p>
            </div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-right">
              {article.tag_list[0] ?? "post"}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
