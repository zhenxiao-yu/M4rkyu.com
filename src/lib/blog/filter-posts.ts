import {
  BLOG_PAGE_SETTINGS,
  BLOG_SORT_MODES,
  DEFAULT_BLOG_SORT,
  type BlogSortMode,
} from "@/content/blog-page";
import type { Post } from "@/content/schemas";

export interface CountEntry {
  value: string;
  count: number;
}

export interface ParsedBlogSearch {
  terms: string[];
  tags: string[];
  categories: string[];
}

export interface BlogFilterState {
  query: string;
  activeTag: string | null;
  activeCategory: string | null;
  sortMode: BlogSortMode;
}

const SORT_MODE_SET = new Set<string>(BLOG_SORT_MODES);
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

export function countValues(values: string[]): CountEntry[] {
  const counts = new Map<string, number>();

  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function sanitizeBlogQuery(value: string): string {
  return value
    .replace(CONTROL_CHARS, "")
    .slice(0, BLOG_PAGE_SETTINGS.maxQueryLength);
}

export function isBlogSortMode(value: string | null): value is BlogSortMode {
  return Boolean(value && SORT_MODE_SET.has(value));
}

export function parseBlogSearch(value: string): ParsedBlogSearch {
  const terms: string[] = [];
  const tags: string[] = [];
  const categories: string[] = [];

  for (const rawToken of value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)) {
    const token = normalize(rawToken);
    if (!token) continue;

    if (token.startsWith("#")) {
      pushIfPresent(tags, token.slice(1));
      continue;
    }
    if (token.startsWith("tag:")) {
      pushIfPresent(tags, token.slice(4));
      continue;
    }
    if (token.startsWith("category:") || token.startsWith("cat:")) {
      pushIfPresent(categories, token.split(":").slice(1).join(":"));
      continue;
    }

    terms.push(token);
  }

  return {
    terms: unique(terms),
    tags: unique(tags),
    categories: unique(categories),
  };
}

export function filterAndSortPosts(
  posts: Post[],
  filters: BlogFilterState,
): Post[] {
  const parsedQuery = parseBlogSearch(filters.query);
  const matches = posts.filter((post) =>
    matchesPost(post, {
      parsedQuery,
      activeTag: filters.activeTag,
      activeCategory: filters.activeCategory,
    }),
  );

  return sortPosts(matches, filters.sortMode, posts);
}

/**
 * Select the top-scoring posts for the /logs spotlight surface.
 * `count` defaults to `BLOG_PAGE_SETTINGS.featuredPostCount` so existing
 * callers stay untouched; the rotator on /logs passes a wider value
 * (e.g. 7) to fill a full bento page without bumping the global setting,
 * which is still consumed by per-card tag limits.
 */
export function selectFeaturedPosts(
  posts: Post[],
  pinned?: Post,
  count: number = BLOG_PAGE_SETTINGS.featuredPostCount,
): Post[] {
  if (count <= 0) return [];

  const pinnedSlug = pinned?.slug;
  const availableSlots = Math.max(count - (pinned ? 1 : 0), 0);
  const ranked = posts
    .filter((post) => post.slug !== pinnedSlug)
    .map((post, index) => ({ post, index, score: featuredScore(post) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, availableSlots)
    .map(({ post }) => post);

  return pinned ? [pinned, ...ranked] : ranked;
}

export function readMinutes(post: Post): number {
  const match = post.readingTime.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function matchesPost(
  post: Post,
  {
    parsedQuery,
    activeTag,
    activeCategory,
  }: {
    parsedQuery: ParsedBlogSearch;
    activeTag: string | null;
    activeCategory: string | null;
  },
): boolean {
  if (activeTag && !post.tags.includes(activeTag)) return false;
  if (activeCategory && post.category !== activeCategory) return false;
  if (
    parsedQuery.tags.length > 0 &&
    !parsedQuery.tags.every((term) =>
      post.tags.some((tag) => normalize(tag).includes(term)),
    )
  ) {
    return false;
  }
  if (
    parsedQuery.categories.length > 0 &&
    !parsedQuery.categories.every((term) =>
      normalize(post.category).includes(term),
    )
  ) {
    return false;
  }
  if (parsedQuery.terms.length === 0) return true;

  const haystack = normalize(
    [
      post.title,
      post.excerpt,
      post.category,
      post.date,
      post.readingTime,
      post.tags.join(" "),
    ].join(" "),
  );

  return parsedQuery.terms.every((term) => haystack.includes(term));
}

function sortPosts(
  posts: Post[],
  sortMode: BlogSortMode,
  source: Post[],
): Post[] {
  const sourceOrder = new Map(source.map((post, index) => [post.slug, index]));

  return [...posts].sort((a, b) => {
    const fallback =
      (sourceOrder.get(a.slug) ?? 0) - (sourceOrder.get(b.slug) ?? 0);

    switch (sortMode) {
      case "popular":
        return engagementScore(b) - engagementScore(a) || fallback;
      case "discussed":
        return (
          b.commentsCount - a.commentsCount ||
          engagementScore(b) - engagementScore(a) ||
          fallback
        );
      case "quick":
        return readMinutes(a) - readMinutes(b) || fallback;
      case "newest":
      default:
        return fallback;
    }
  });
}

function featuredScore(post: Post): number {
  return (
    engagementScore(post) +
    (post.coverImage ? 16 : 0) +
    Math.max(0, 12 - readMinutes(post))
  );
}

function engagementScore(post: Post): number {
  return post.reactionsCount * 2 + post.commentsCount * 4;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function pushIfPresent(target: string[], value: string) {
  if (value) target.push(value);
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export { DEFAULT_BLOG_SORT };
export type { BlogSortMode };
