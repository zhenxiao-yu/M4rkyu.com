import type { Note, Post } from "@/content/schemas";
import { SITE_URL } from "@/lib/seo/site";

// Pure feed assembly — deliberately imports no server-only content sources
// so it stays unit-testable in a node environment. `items.ts` wires the
// real DB/dev.to sources into {@link assembleFeed}.

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  /** Normalized to an ISO-8601 string, or undefined when unparseable. */
  date?: string;
  /** Cover image URL when the source carries one (logs only today). */
  image?: string;
  tags: string[];
}

export const FEED_LIMIT = 40;

export function firstLine(value: string): string {
  return value.split("\n").find((line) => line.trim())?.trim() ?? value;
}

// dev.to posts expose a machine `publishedAt` (ISO) and a human-readable
// `date` ("May 13"); only the former is feed-safe. Notes always carry an
// ISO `publishedAt`. Normalize everything to ISO so both feeds emit
// spec-valid dates (RFC-822 / RFC-3339) and sort deterministically.
export function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function sortKey(date: string | undefined): number {
  const parsed = Date.parse(date ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Merge public notes + logs into one newest-first feed. Pure — takes its
 * sources as input so the RSS and JSON routes (which both map this single
 * array) can never drift in ordering, item count, or date handling.
 */
export function assembleFeed(sources: {
  notes: readonly Note[];
  posts: readonly Post[];
}): FeedItem[] {
  return [
    ...sources.notes.map((note) => ({
      id: `note:${note.slug}`,
      title: note.title || firstLine(note.body),
      summary: firstLine(note.body),
      url: `${SITE_URL}/en/notes#${note.slug}`,
      date: toIso(note.publishedAt),
      tags: note.tags,
    })),
    ...sources.posts.map((post) => ({
      id: `log:${post.slug}`,
      title: post.title,
      summary: post.excerpt,
      url: `${SITE_URL}/en/logs/${post.slug}`,
      date: toIso(post.publishedAt ?? post.date),
      image: post.coverImage?.src,
      tags: post.tags,
    })),
  ]
    .sort((a, b) => sortKey(b.date) - sortKey(a.date))
    .slice(0, FEED_LIMIT);
}
