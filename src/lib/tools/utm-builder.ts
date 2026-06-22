// Pure campaign-URL builder shared by the utm-builder tool. No React, no DOM —
// unit-tested in tests/unit/tools/utm-builder.test.ts.
//
// The job: take a base URL plus a bag of UTM params and produce a single,
// correctly-encoded campaign URL. Two real-world hazards are handled here so
// the UI doesn't have to:
//
//   1. Encoding. Values flow through `URLSearchParams`, so spaces, `&`, `?`,
//      `#`, and unicode are percent-encoded — no hand-rolled string concat.
//   2. Existing query strings. A base of `…/work?ref=x` must *merge* the UTM
//      params into the existing query, never produce a second `?`. `new URL`
//      parses the existing search, and `searchParams.set` overwrites a colliding
//      key (so re-tagging an already-tagged URL is idempotent, not duplicated).
//
// Only http(s) URLs are accepted as valid. Anything else (a bare word, a
// `mailto:`, a relative path, empty) returns `{ ok: false }` — the UI still
// lets the user copy what they typed, but flags it as not a valid link.

/** The canonical UTM parameter keys, in the order the UI renders them. */
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export type UtmParams = Partial<Record<UtmKey, string>>;

export type BuildUtmResult = { ok: true; url: string } | { ok: false };

/**
 * Build a campaign URL from a base and a set of UTM params.
 *
 * Returns `{ ok: true, url }` only when `base` parses as an http(s) URL.
 * Params are trimmed; empty (or whitespace-only) values are omitted entirely
 * so the query stays clean. An existing query string on the base is preserved
 * and merged — colliding UTM keys are overwritten, not duplicated.
 */
export function buildUtmUrl(base: string, params: UtmParams = {}): BuildUtmResult {
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return { ok: false };
  }

  // Reject non-web schemes (mailto:, tel:, file:, javascript:, …). UTM params
  // only mean anything on an http(s) link.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false };
  }

  for (const key of UTM_KEYS) {
    const raw = params[key];
    const value = raw?.trim();
    if (value) {
      url.searchParams.set(key, value);
    } else {
      // Drop a key the caller cleared (or that was never set) so re-builds
      // don't leave a stale empty param behind.
      url.searchParams.delete(key);
    }
  }

  return { ok: true, url: url.toString() };
}
