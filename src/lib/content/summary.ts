import type { z } from "zod";
import { contentStatusSchema } from "@/content/schemas";

export type ContentStatus = z.infer<typeof contentStatusSchema>;

export interface ContentSummary {
  total: number;
  ready: number;
  draft: number;
  placeholder: number;
  comingSoon: number;
}

/**
 * Count items by `contentStatus`/`status` across any content
 * collection that conforms to the shared `contentStatusSchema`.
 *
 * Pass an explicit `getStatus` selector when the collection's
 * status field isn't named `status` (e.g. projects use
 * `contentStatus`).
 *
 * Replaces ad-hoc per-page filters like
 * `games.filter(g => g.status === "ready").length`.
 */
export function summarize<T>(
  items: readonly T[],
  getStatus: (item: T) => ContentStatus = (item) =>
    (item as { status: ContentStatus }).status,
): ContentSummary {
  const summary: ContentSummary = {
    total: items.length,
    ready: 0,
    draft: 0,
    placeholder: 0,
    comingSoon: 0,
  };
  for (const item of items) {
    const status = getStatus(item);
    if (status === "ready") summary.ready += 1;
    else if (status === "draft") summary.draft += 1;
    else if (status === "placeholder") summary.placeholder += 1;
    else if (status === "coming-soon") summary.comingSoon += 1;
  }
  return summary;
}
