/**
 * Typed bindings for the dev.to public API.
 *
 * Endpoint docs: https://developers.forem.com/api
 *
 * Read-only, no API key required for published-article reads.
 * The fetch uses Next 15's `next: { revalidate }` cache so the
 * blog timeline stays static between revalidation windows; the
 * first request after the window expires re-fetches and updates
 * the cache. No client-side fetching, ever.
 *
 * The exported fetchers are wrapped in React's `cache()` so callers
 * within the same render (e.g. `generateStaticParams`,
 * `generateMetadata`, and the page component all asking for the
 * same article list) share a single resolved promise instead of
 * re-parsing the response. Across requests, the underlying
 * `fetch()` data cache still amortises the upstream call.
 */

import { cache } from "react";

const DEVTO_BASE = "https://dev.to/api";

/** Cache TTL in seconds. 1 day is plenty for a personal blog. */
const REVALIDATE_SECONDS = 86_400;

/** Subset of fields actually used by the site. dev.to returns more. */
export interface DevtoArticleListItem {
  type_of: "article";
  id: number;
  title: string;
  description: string;
  slug: string;
  url: string;
  canonical_url: string;
  cover_image: string | null;
  social_image: string | null;
  published_at: string;
  edited_at: string | null;
  readable_publish_date: string;
  reading_time_minutes: number;
  tag_list: string[];
  comments_count: number;
  positive_reactions_count: number;
}

export interface DevtoArticle extends DevtoArticleListItem {
  body_markdown: string;
  body_html: string;
}

interface FetchOptions {
  /** Override the cache TTL for this call (seconds). */
  revalidate?: number;
}

/**
 * Fetch the published article list for `username`. Returns the
 * subset of fields the site actually consumes. Newest first per
 * dev.to default ordering.
 *
 * Returns `[]` if the API call fails so a build-time outage does
 * not break the deploy. The error is logged for observability.
 */
export const fetchDevtoArticles = cache(async function fetchDevtoArticles(
  username: string,
  { revalidate = REVALIDATE_SECONDS }: FetchOptions = {},
): Promise<DevtoArticleListItem[]> {
  try {
    const url = `${DEVTO_BASE}/articles?username=${encodeURIComponent(
      username,
    )}&per_page=100`;
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) {
      console.warn(
        `[devto] articles list returned ${response.status} for ${username}`,
      );
      return [];
    }
    const data = (await response.json()) as DevtoArticleListItem[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("[devto] articles list fetch failed:", error);
    return [];
  }
});

/**
 * Fetch one article (with `body_markdown` + `body_html`) by id.
 *
 * Returns `null` if the article is missing or the call fails.
 */
export const fetchDevtoArticle = cache(async function fetchDevtoArticle(
  id: number,
  { revalidate = REVALIDATE_SECONDS }: FetchOptions = {},
): Promise<DevtoArticle | null> {
  try {
    const response = await fetch(`${DEVTO_BASE}/articles/${id}`, {
      next: { revalidate },
    });
    if (!response.ok) {
      console.warn(`[devto] article ${id} returned ${response.status}`);
      return null;
    }
    return (await response.json()) as DevtoArticle;
  } catch (error) {
    console.warn(`[devto] article ${id} fetch failed:`, error);
    return null;
  }
});
