// Pure case-conversion logic shared by the case-converter tool. No React, no
// DOM — unit-tested in tests/unit/tools/case.test.ts.
//
// Every transform is total: it never throws. The word splitter is the heart of
// the tool, so it has to survive real-world input — empty strings, runs of
// spaces/punctuation, leading/trailing separators, digits glued to letters,
// and unicode (accented Latin, CJK). We split on case boundaries and any
// non-alphanumeric run (treating underscores/dashes/dots/slashes and
// whitespace alike), keep unicode letters and digits as word characters, and
// drop empty fragments so `convertAll("")` and `convertAll("  __  ")` both
// yield empty output rather than artefacts like a lone separator.

/** The canonical id for each conversion, also the i18n label key. */
export type CaseKey =
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "title"
  | "sentence"
  | "upper"
  | "lower";

/**
 * Split arbitrary text into lowercase-agnostic words. Boundaries are:
 *  - a lower/digit → upper transition (camelCase → "camel" "Case"),
 *  - any run of non-alphanumeric characters (spaces, _ - . / \, punctuation).
 *
 * Unicode letters and digits are word characters (`\p{L}` / `\p{N}` via the
 * `u` flag), so accented Latin and CJK survive. Empty fragments are dropped,
 * so the result is `[]` for input that is empty or all separators.
 */
export function splitWords(text: string): string[] {
  if (!text) return [];
  return text
    // insert a boundary between a lower/digit and an upper letter
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, "$1 $2")
    // collapse every non-alphanumeric run into a single space
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/** Capitalize the first character, lowercase the rest. Total on empty input. */
export function capitalize(word: string): string {
  if (!word) return "";
  return word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase();
}

export function toCamelCase(text: string): string {
  return splitWords(text)
    .map((w, i) => (i === 0 ? w.toLocaleLowerCase() : capitalize(w)))
    .join("");
}

export function toPascalCase(text: string): string {
  return splitWords(text).map(capitalize).join("");
}

export function toSnakeCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLocaleLowerCase())
    .join("_");
}

export function toKebabCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLocaleLowerCase())
    .join("-");
}

export function toConstantCase(text: string): string {
  return splitWords(text)
    .map((w) => w.toLocaleUpperCase())
    .join("_");
}

export function toTitleCase(text: string): string {
  return splitWords(text).map(capitalize).join(" ");
}

export function toSentenceCase(text: string): string {
  const words = splitWords(text).map((w) => w.toLocaleLowerCase());
  if (words.length === 0) return "";
  return [capitalize(words[0]), ...words.slice(1)].join(" ");
}

/**
 * Raw upper/lowercase — these intentionally operate on the *original* string
 * (preserving spacing and punctuation), not the word split, matching what
 * users expect from "UPPERCASE" / "lowercase".
 */
export function toUpper(text: string): string {
  return text.toLocaleUpperCase();
}

export function toLower(text: string): string {
  return text.toLocaleLowerCase();
}

const TRANSFORMS: Record<CaseKey, (text: string) => string> = {
  camel: toCamelCase,
  pascal: toPascalCase,
  snake: toSnakeCase,
  kebab: toKebabCase,
  constant: toConstantCase,
  title: toTitleCase,
  sentence: toSentenceCase,
  upper: toUpper,
  lower: toLower,
};

/** Stable display order for the UI. */
export const CASE_KEYS: readonly CaseKey[] = [
  "camel",
  "pascal",
  "snake",
  "kebab",
  "constant",
  "title",
  "sentence",
  "upper",
  "lower",
];

export interface CaseResult {
  key: CaseKey;
  value: string;
}

/**
 * Run every transform once. `empty: true` means the input had no convertible
 * content (empty or separators-only) — a valid state, never an error. The
 * `results` array is always populated in {@link CASE_KEYS} order.
 *
 * Emptiness is keyed on the word split, not on the result strings: `toUpper` /
 * `toLower` echo the raw input verbatim, so separators-only input would leave
 * them non-empty even though there are no real words to convert.
 */
export function convertAll(input: string): {
  empty: boolean;
  results: CaseResult[];
} {
  const empty = splitWords(input).length === 0;
  const results = CASE_KEYS.map((key) => ({
    key,
    value: TRANSFORMS[key](input),
  }));
  return { empty, results };
}
