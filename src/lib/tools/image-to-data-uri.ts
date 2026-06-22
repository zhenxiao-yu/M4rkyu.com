// Pure helpers for the image-to-data-uri tool. No React, no DOM — the actual
// file read lives in the component (via @/components/tools/_shared/file-input).
// Unit-tested in tests/unit/tools/image-to-data-uri.test.ts.
//
// These functions are total: they never throw. Given a data URI string they
// build copy-ready snippets (an <img> tag, a CSS background-image rule) and
// extract the declared MIME type. Malformed input degrades gracefully rather
// than erroring, because the source is user-supplied.

/** A `data:` URI is required for the snippets to be meaningful, but any string
 *  is accepted — we never throw on bad input. */
export interface DataUriSnippets {
  /** `<img src="…" alt="" />` */
  imgTag: string;
  /** `background-image: url("…");` */
  cssBackground: string;
}

/**
 * Pull the MIME type out of a `data:` URI, e.g.
 * `data:image/png;base64,AAAA` → `"image/png"`. Returns `null` when the
 * string isn't a recognizable data URI (so the caller can fall back to the
 * File's own `type`).
 */
export function dataUriMimeType(uri: string): string | null {
  const match = /^data:([^;,]+)[;,]/.exec(uri);
  return match ? match[1] : null;
}

/**
 * Build copy-ready embedding snippets from a data URI. The URI is inserted as
 * a double-quoted string in both, so we strip any literal double quotes from
 * the URI first to keep the snippets syntactically valid (data URIs never
 * legitimately contain a bare `"`).
 */
export function buildSnippets(uri: string): DataUriSnippets {
  const safe = uri.replace(/"/g, "");
  return {
    imgTag: `<img src="${safe}" alt="" />`,
    cssBackground: `background-image: url("${safe}");`,
  };
}
