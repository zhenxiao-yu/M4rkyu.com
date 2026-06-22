// Pure lookup logic for the mime-finder tool. No React, no DOM — unit-tested in
// tests/unit/tools/mime-finder.test.ts.
//
// The DATA (extensions, MIME strings, descriptions) is verbatim and lives in the
// component. This module only normalizes a user query and filters the list. The
// query is never compiled into a RegExp — matching is plain substring inclusion
// on lower-cased fields, so hostile or malformed input (".", "*", "[(", a lone
// dot, whitespace) can neither crash nor inject a pattern.

export interface MimeEntry {
  ext: string;
  mime: string;
  description: string;
}

/**
 * Normalize a raw query: trim, lower-case, and drop a single leading dot so
 * ".png" and "png" resolve identically. Returns "" for empty/whitespace input,
 * which callers treat as "show everything".
 */
export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/^\.+/, "");
}

/**
 * Filter `list` by a free-text query against extension, MIME type, and
 * description. Case-insensitive; tolerates a leading dot; empty/whitespace
 * query returns the full list unchanged (same reference). Never throws and
 * never builds a RegExp from user input.
 */
export function findMime(list: readonly MimeEntry[], query: string): MimeEntry[] {
  const q = normalizeQuery(query);
  if (!q) return list.slice();
  return list.filter(
    (entry) =>
      entry.ext.toLowerCase().includes(q) ||
      entry.mime.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q),
  );
}
