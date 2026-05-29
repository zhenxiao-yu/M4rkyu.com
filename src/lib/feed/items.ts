import { getPosts } from "@/lib/blog/get-posts";
import { getNotesSource } from "@/lib/notes/source";
import { SITE_URL } from "@/lib/seo/site";

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  /** Normalized to an ISO-8601 string, or undefined when unparseable. */
  date?: string;
  tags: string[];
}

const FEED_LIMIT = 40;

export function firstLine(value: string): string {
  return value.split("\n").find((line) => line.trim())?.trim() ?? value;
}

// dev.to posts expose a machine `publishedAt` (ISO) and a human-readable
// `date` ("May 13"); only the former is feed-safe. Notes always carry an
// ISO `publishedAt`. Normalize everything to ISO so both feeds emit
// spec-valid dates (RFC-822 / RFC-3339) and sort deterministically.
function toIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function sortKey(date: string | undefined): number {
  const parsed = Date.parse(date ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Merged, newest-first feed of public notes and logs, shared by the RSS
 * and JSON feed routes so the two surfaces can never drift in ordering,
 * item count, or date handling.
 */
export async function getFeedItems(): Promise<FeedItem[]> {
  const [notes, posts] = await Promise.all([getNotesSource(), getPosts()]);
  return [
    ...notes.map((note) => ({
      id: `note:${note.slug}`,
      title: note.title || firstLine(note.body),
      summary: firstLine(note.body),
      url: `${SITE_URL}/en/notes#${note.slug}`,
      date: toIso(note.publishedAt),
      tags: note.tags,
    })),
    ...posts.map((post) => ({
      id: `log:${post.slug}`,
      title: post.title,
      summary: post.excerpt,
      url: `${SITE_URL}/en/logs/${post.slug}`,
      date: toIso(post.publishedAt ?? post.date),
      tags: post.tags,
    })),
  ]
    .sort((a, b) => sortKey(b.date) - sortKey(a.date))
    .slice(0, FEED_LIMIT);
}
