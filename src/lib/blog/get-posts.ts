import { postSchema, type Post } from "@/content/schemas";
import { fetchDevtoArticles, type DevtoArticleListItem } from "./devto";

/** dev.to username feeding the /logs timeline. */
export const DEVTO_USERNAME = "markyu";

/**
 * Convert one dev.to article into the site's `Post` shape, or
 * `null` if the upstream row is malformed enough that
 * `postSchema.parse` rejects it. The caller (`getPosts`) drops
 * nulls so one bad article doesn't take out the whole timeline.
 */
export function devtoArticleToPost(article: DevtoArticleListItem): Post | null {
  // Pick the most specific tag as the visible category eyebrow;
  // fall back to "Devlog" for untagged posts.
  const category = article.tag_list[0]
    ? capitalize(article.tag_list[0])
    : "Devlog";

  const result = postSchema.safeParse({
    title: article.title,
    slug: article.slug,
    category,
    excerpt: article.description,
    date: article.readable_publish_date,
    publishedAt: article.published_at,
    readingTime: `${article.reading_time_minutes} min read`,
    tags: article.tag_list,
    status: "ready",
    pinned: false,
    canonicalUrl: article.canonical_url,
    coverImage: article.cover_image
      ? { src: article.cover_image, alt: article.title }
      : undefined,
    reactionsCount: article.positive_reactions_count,
    commentsCount: article.comments_count,
  });

  if (!result.success) {
    console.warn(
      `[devto] dropping article ${article.id} (${article.slug}): ${result.error.message}`,
    );
    return null;
  }
  return result.data;
}

/**
 * Build-time fetch of every published dev.to article for
 * `username`, mapped into `Post[]`. Sorted newest-first.
 *
 * Returns `[]` if dev.to is unreachable so a temporary outage
 * does not break the deploy. Per-article validation failures are
 * logged and the offending row is dropped from the result.
 */
export async function getPosts(
  username: string = DEVTO_USERNAME,
): Promise<Post[]> {
  const articles = await fetchDevtoArticles(username);
  return articles
    .map(devtoArticleToPost)
    .filter((post): post is Post => post !== null);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
