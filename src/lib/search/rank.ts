import type { SearchDoc } from "@/lib/search/catalog";

/**
 * Tiered scoring filter. Promotes exact prefix and word-boundary hits ahead
 * of mid-string substrings, then falls back to in-order fuzzy as a last
 * resort. Returns 0 to hide a row. Pure — safe to run per keystroke across
 * the whole catalog. Shared by the command palette (cmdk filter) and the
 * /search page so the two ranking behaviours never diverge.
 */
export function rankCommand(value: string, search: string): number {
  const needle = search.trim().toLowerCase();
  if (!needle) return 1;
  const haystack = value.toLowerCase();
  if (haystack.startsWith(needle)) return 1;
  for (const word of haystack.split(/\s+/)) {
    if (word.startsWith(needle)) return 0.85;
  }
  if (haystack.includes(needle)) return 0.6;
  // Fuzzy: every needle char appears in order somewhere in haystack.
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++;
  }
  return i === needle.length ? 0.3 : 0;
}

/**
 * Rank a catalog against a free-text query, scoring the strongest field per
 * doc (title weighted highest, then tags, subtitle, and a discounted
 * description) and returning matches sorted by score desc. An empty query
 * returns the head of the catalog unfiltered.
 */
export function searchDocs(
  catalog: readonly SearchDoc[],
  query: string,
  limit = 40,
): SearchDoc[] {
  const q = query.trim();
  if (!q) return catalog.slice(0, limit);
  return catalog
    .map((doc) => {
      const title = rankCommand(doc.title, q);
      const tags = doc.tags?.length
        ? Math.max(...doc.tags.map((tag) => rankCommand(tag, q)))
        : 0;
      const subtitle = doc.subtitle ? rankCommand(doc.subtitle, q) : 0;
      const description = rankCommand(doc.description, q);
      const score = Math.max(
        title,
        tags * 0.9,
        subtitle * 0.8,
        description * 0.5,
      );
      return { doc, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.doc);
}
