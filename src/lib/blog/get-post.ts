import {
  fetchDevtoArticle,
  fetchDevtoArticles,
  type DevtoArticle,
  type DevtoArticleListItem,
} from "./devto";
import { DEVTO_USERNAME } from "./get-posts";

export interface ResolvedPost {
  /** Listing-level metadata (slug, title, tag_list, etc.). */
  meta: DevtoArticleListItem;
  /** Full article including `body_markdown` + `body_html`. */
  full: DevtoArticle;
}

/**
 * Resolve a single dev.to article by slug.
 *
 * dev.to's per-article endpoint is keyed by `id`, not `slug`, so
 * we hit the listing first to map slug → id, then fetch the full
 * article. Both calls go through Next 15 ISR (24h cache), so
 * repeated post-page renders share data with the timeline.
 *
 * Returns `null` when the slug is unknown so the page can call
 * `notFound()`.
 */
export async function getPostBySlug(
  slug: string,
  username: string = DEVTO_USERNAME,
): Promise<ResolvedPost | null> {
  const articles = await fetchDevtoArticles(username);
  if (articles.length === 0) return null;
  const meta = articles.find((a) => a.slug === slug);
  if (!meta) return null;
  const full = await fetchDevtoArticle(meta.id);
  if (!full) return null;
  return { meta, full };
}

/**
 * All known post slugs. Used by `generateStaticParams` so each
 * post page is statically generated at build time.
 */
export async function getAllPostSlugs(
  username: string = DEVTO_USERNAME,
): Promise<string[]> {
  const articles = await fetchDevtoArticles(username);
  return articles.map((a) => a.slug);
}
