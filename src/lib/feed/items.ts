import { getPosts } from "@/lib/blog/get-posts";
import { getNotesSource } from "@/lib/notes/source";
import { assembleFeed } from "@/lib/feed/assemble";

// Re-export the pure surface so existing importers of "@/lib/feed/items"
// keep working; the testable logic lives in ./assemble (no server-only deps).
export {
  assembleFeed,
  firstLine,
  toIso,
  FEED_LIMIT,
  type FeedItem,
} from "@/lib/feed/assemble";

/** Wire the real content sources into {@link assembleFeed}. */
export async function getFeedItems() {
  const [notes, posts] = await Promise.all([getNotesSource(), getPosts()]);
  return assembleFeed({ notes, posts });
}
