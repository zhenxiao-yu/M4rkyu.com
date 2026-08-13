// Pure slug helpers for the admin "duplicate" actions.
//
// Duplicating a record needs a fresh `<base>-copy[-n]` slug that no existing
// row already uses. The old per-domain code probed the DB once *per candidate*
// (up to 50 sequential round-trips); callers now fetch the small set of
// existing `<base>-copy%` slugs in one query and resolve the free one here, in
// memory. Kept framework-pure (no DB, no "use server") so it is unit-tested.

/** SQL `LIKE` pattern matching every existing copy-slug for a base slug. */
export function copySlugLikePattern(base: string): string {
  return `${base}-copy%`;
}

/**
 * First unused `<base>-copy[-n]` slug given the set already taken.
 *
 * Tries `<base>-copy`, then `<base>-copy-2`, `<base>-copy-3`, … each truncated
 * to `maxLen`. `taken` should be the existing slugs matching
 * {@link copySlugLikePattern}; anything else is ignored. Falls back to the last
 * candidate after `limit` attempts (astronomically unlikely in practice — the
 * DB slug-uniqueness constraint is the real backstop).
 */
export function nextCopySlug(
  base: string,
  taken: Iterable<string>,
  maxLen = 80,
  limit = 1000,
): string {
  const takenSet = new Set(taken);
  const first = `${base}-copy`.slice(0, maxLen);
  if (!takenSet.has(first)) return first;
  let candidate = first;
  for (let n = 2; n <= limit; n += 1) {
    candidate = `${base}-copy-${n}`.slice(0, maxLen);
    if (!takenSet.has(candidate)) return candidate;
  }
  return candidate;
}
