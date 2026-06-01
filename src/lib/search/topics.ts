import { buildSearchCatalog, type SearchDoc } from "@/lib/search/catalog";

// Minimum ready items for a tag to earn its own hub page. Below this a
// topic page is thin content — bad for readers and a soft-404 risk for
// search engines — so single-item tags are dropped from the index.
export const MIN_TOPIC_SIZE = 2;

export interface Topic {
  /** URL-safe slug used in /topics/[tag]. */
  slug: string;
  /** Human label (the original tag casing, first seen). */
  label: string;
  docs: SearchDoc[];
}

/** Lowercase, collapse non-alphanumerics to single hyphens, trim hyphens. */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Group the cross-domain search catalog into topic hubs by tag. Pure —
 * accepts its docs so it stays deterministically testable; the real
 * content arrays are wired in via {@link getAllTopics}. Tags that
 * slugify to the same value (e.g. "React" / "react") merge; a doc is
 * never listed twice within one topic. Only tags meeting
 * {@link MIN_TOPIC_SIZE} survive. Sorted by size desc, then label.
 */
export function buildTopicIndex(docs: SearchDoc[]): Topic[] {
  const bySlug = new Map<string, { label: string; docs: SearchDoc[] }>();
  for (const doc of docs) {
    for (const tag of doc.tags ?? []) {
      const slug = slugifyTag(tag);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (!existing) {
        bySlug.set(slug, { label: tag, docs: [doc] });
      } else if (!existing.docs.includes(doc)) {
        existing.docs.push(doc);
      }
    }
  }
  return Array.from(bySlug.entries())
    .filter(([, topic]) => topic.docs.length >= MIN_TOPIC_SIZE)
    .map(([slug, topic]) => ({ slug, label: topic.label, docs: topic.docs }))
    .sort(
      (a, b) => b.docs.length - a.docs.length || a.label.localeCompare(b.label),
    );
}

// Built once per server process from the static content arrays — the same
// deterministic source the AI search catalog uses.
let cache: Topic[] | null = null;

export function getAllTopics(): Topic[] {
  if (!cache) cache = buildTopicIndex(buildSearchCatalog());
  return cache;
}

export function getTopic(slug: string): Topic | undefined {
  return getAllTopics().find((topic) => topic.slug === slug);
}
