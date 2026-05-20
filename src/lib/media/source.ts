import "server-only";

import { cache } from "react";
import { mediaItems } from "@/content/media";
import { dbMediaRowToItem, getDbMediaItems } from "@/lib/media/db";
import type { MediaItem } from "@/content/schemas";

// Unified read of media — DB first, static src/content/media.ts as
// zero-downtime fallback. Public surfaces (/media) consume this and
// never see the underlying source.
//
// Cutover: as soon as the media_items table has ≥1 row, the public
// surface flips to DB-backed reads. Until then, the static array
// remains authoritative.

export const getMediaSource = cache(async (): Promise<MediaItem[]> => {
  const rows = await getDbMediaItems();
  if (rows.length === 0) return mediaItems;
  return rows.map(dbMediaRowToItem);
});
