export interface ImportReport {
  section: string;
  totalStatic: number;
  inserted: number;
  skipped: number;
  skippedSlugs: string[];
}

/**
 * Pure dedupe: drop any item whose slug already exists in the DB
 * (`existing`) or that repeats earlier in this same batch.
 */
export function partitionBySlug<T>(
  items: T[],
  existing: Set<string>,
  slugOf: (t: T) => string,
): { toInsert: T[]; skippedSlugs: string[] } {
  const seen = new Set<string>();
  const toInsert: T[] = [];
  const skippedSlugs: string[] = [];
  for (const item of items) {
    const slug = slugOf(item);
    if (existing.has(slug) || seen.has(slug)) {
      skippedSlugs.push(slug);
      continue;
    }
    seen.add(slug);
    toInsert.push(item);
  }
  return { toInsert, skippedSlugs };
}
