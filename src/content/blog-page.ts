/**
 * Manual editing surface for the /logs index.
 *
 * Copy remains in `messages/*.json`; these values are the small product/design
 * knobs a maintainer is most likely to change without touching component JSX.
 */
export const BLOG_PAGE_SETTINGS = {
  featuredPostCount: 3,
  inlineTagCount: 7,
  maxQueryLength: 120,
  featuredLeadTagLimit: 5,
} as const;

export const BLOG_SORT_MODES = [
  "newest",
  "popular",
  "discussed",
  "quick",
] as const;

export type BlogSortMode = (typeof BLOG_SORT_MODES)[number];

export const DEFAULT_BLOG_SORT: BlogSortMode = "newest";
