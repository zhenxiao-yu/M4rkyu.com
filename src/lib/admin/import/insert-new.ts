import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { partitionBySlug } from "./types";

/**
 * Read existing slugs from `table`, partition `items` to the new ones,
 * insert them, and return the new {id, slug} pairs (for child-row FKs).
 * On dryRun, reads + partitions but does not insert.
 */
export async function insertNewBySlug<T>(
  supabase: SupabaseClient,
  table: string,
  items: T[],
  slugOf: (t: T) => string,
  toRow: (t: T) => Record<string, unknown>,
  dryRun: boolean,
): Promise<{
  inserted: number;
  skippedSlugs: string[];
  insertedRows: { id: string; slug: string }[];
}> {
  const { data: existing, error: readError } = await supabase
    .from(table)
    .select("slug");
  if (readError) throw new Error(readError.message);
  const taken = new Set((existing ?? []).map((r: { slug: string }) => r.slug));
  const { toInsert, skippedSlugs } = partitionBySlug(items, taken, slugOf);

  if (dryRun || toInsert.length === 0) {
    return { inserted: 0, skippedSlugs, insertedRows: [] };
  }

  const { data, error } = await supabase
    .from(table)
    .insert(toInsert.map(toRow))
    .select("id, slug");
  if (error) throw new Error(error.message);
  const insertedRows = (data ?? []) as { id: string; slug: string }[];
  return { inserted: insertedRows.length, skippedSlugs, insertedRows };
}
