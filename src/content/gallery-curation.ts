/**
 * Editorial curation for the /archive index — ordering + location links.
 * Kept in the content layer (not the route) so it stays data-adjacent and is
 * trivial to extend as more collections land. None of this is required: a
 * collection not named here just falls back to default order with no map link.
 */

/**
 * Collections pinned to the front of the index, in this order. The lead slot
 * is curated — Artworks almost always leads — and everything not listed falls
 * back to featured-first, then source order. Matched by collection slug.
 */
export const PINNED_COLLECTION_SLUGS = ["artworks"] as const;

/**
 * Map-searchable place names for location collections, keyed by slug. When a
 * collection has an entry, its index row shows an external "locate on map"
 * link so people can place a trip before opening the set. Extend as new
 * locations land; collections without an entry simply show no map link.
 */
export const COLLECTION_PLACE_QUERIES: Record<string, string> = {
  chengdu: "Chengdu, China",
  chongqing: "Chongqing, China",
  beijing: "Beijing, China",
  tibet: "Tibet",
  "travel-contact-sheets": "China",
};

/** Provider-agnostic maps search URL — no API key, opens the place in maps. */
export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Stable front-to-back rank for a slug given the pin list (lower = earlier). */
export function pinnedRank(slug: string): number {
  const i = (PINNED_COLLECTION_SLUGS as readonly string[]).indexOf(slug);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
}
