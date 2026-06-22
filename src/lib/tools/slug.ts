// Pure slugify logic shared by the slug tool. No React, no DOM — unit-tested
// in tests/unit/tools/slug.test.ts.
//
// `slugify` is total: it never throws. The job is to turn arbitrary human text
// into a URL-safe slug, surviving real-world input — accented Latin ("Café" →
// "cafe"), emoji (dropped), runs of spaces/punctuation (collapsed to a single
// separator), leading/trailing separators (trimmed), and empty input ("").
//
// CJK has no ASCII fold, so naive ASCII-only slugging would erase it entirely.
// When the ASCII pass leaves nothing but the input *did* contain word
// characters (Han/Hiragana/Katakana/Hangul, accented letters…), we fall back
// to a unicode-preserving pass so "你好 世界" → "你好-世界" rather than "".

export type SlugSeparator = "-" | "_";

export interface SlugOptions {
  /** Word separator inserted between tokens. Default `"-"`. */
  separator?: SlugSeparator;
  /** Lowercase the result. Default `true`. */
  lowercase?: boolean;
}

const DEFAULTS: Required<SlugOptions> = { separator: "-", lowercase: true };

/** Escape a single char for safe use inside a RegExp character class / literal. */
function escapeRe(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Collapse every run of non-(letter/number) characters into a single
 * separator, then trim separators off both ends. Shared by the ASCII and
 * unicode passes — only the "allowed" class differs.
 */
function squeeze(value: string, allowed: RegExp, separator: string): string {
  const sep = escapeRe(separator);
  return value
    .replace(allowed, separator)
    .replace(new RegExp(`${sep}{2,}`, "g"), separator)
    .replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "");
}

/**
 * Turn arbitrary text into a URL slug.
 *
 * Pipeline: NFKD-normalize and strip combining marks (diacritics fold away),
 * drop apostrophes/quotes so contractions stay one word, then replace every
 * non-`[a-z0-9]` run with the separator and trim. Emoji and other symbols are
 * not `[a-z0-9]`, so they collapse out naturally.
 *
 * Falls back to a unicode-preserving pass (keeping `\p{L}`/`\p{N}`, e.g. CJK)
 * only when the ASCII pass yields "" but the input held real word characters —
 * so non-Latin scripts produce a usable slug instead of an empty string.
 */
export function slugify(text: string, options: SlugOptions = {}): string {
  const { separator, lowercase } = { ...DEFAULTS, ...options };

  const normalized = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/['"`’]/g, ""); // drop quotes/apostrophes (don't split words)

  const cased = lowercase ? normalized.toLowerCase() : normalized;

  // Primary ASCII pass: anything outside [a-z0-9] (after the lowercase toggle,
  // so include A-Z when not lowercasing) becomes a separator.
  const asciiClass = lowercase ? /[^a-z0-9]+/g : /[^a-zA-Z0-9]+/g;
  const ascii = squeeze(cased, asciiClass, separator);
  if (ascii) return ascii;

  // Fallback: the ASCII slug is empty. If the input still holds unicode word
  // characters (CJK, Greek, Cyrillic…), keep them instead of returning "".
  if (/[\p{L}\p{N}]/u.test(cased)) {
    return squeeze(cased, /[^\p{L}\p{N}]+/gu, separator);
  }

  return "";
}

export interface SlugResult {
  slug: string;
  /** True when the input produced no slug — a valid state, never an error. */
  empty: boolean;
}

/** Convenience wrapper pairing the slug with an `empty` flag for the UI. */
export function runSlug(text: string, options: SlugOptions = {}): SlugResult {
  const slug = slugify(text, options);
  return { slug, empty: slug === "" };
}
