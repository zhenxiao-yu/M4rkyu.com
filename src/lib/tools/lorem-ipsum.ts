// Pure lorem-ipsum generation for the lorem-ipsum tool. No React, no DOM — the
// caller injects an optional rng so the module stays fully deterministic under
// test (tests/unit/tools/lorem-ipsum.test.ts) while the component lets it fall
// back to Math.random in the browser. A seeded reroll is handled by the caller
// passing a fresh rng; this module just consumes one.

/** Bounds keep a stray request from allocating an absurd string / freezing the tab. */
export const LOREM_MIN_COUNT = 1;
export const LOREM_MAX_PARAGRAPHS = 100;
export const LOREM_MAX_SENTENCES = 200;
export const LOREM_MAX_WORDS = 1000;

export type LoremUnit = "paragraphs" | "sentences" | "words";

export interface LoremOptions {
  count: number;
  unit: LoremUnit;
  /** Prefix the very first sentence with the canonical "Lorem ipsum dolor sit amet". */
  startWithLorem: boolean;
}

/** Classic lorem-ipsum vocabulary, lower-cased; sentences capitalize on emit. */
const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod " +
  "tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam " +
  "quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo " +
  "consequat duis aute irure in reprehenderit voluptate velit esse cillum " +
  "fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt " +
  "culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

/** Canonical opener so `startWithLorem` always produces the familiar phrase. */
const LOREM_OPENER = ["lorem", "ipsum", "dolor", "sit", "amet"];

/** The max count permitted for a given unit. Exported for the component's clamp. */
export function maxForUnit(unit: LoremUnit): number {
  if (unit === "words") return LOREM_MAX_WORDS;
  if (unit === "sentences") return LOREM_MAX_SENTENCES;
  return LOREM_MAX_PARAGRAPHS;
}

function clampCount(count: number, unit: LoremUnit): number {
  const max = maxForUnit(unit);
  const n = Math.trunc(count);
  if (!Number.isFinite(n)) return LOREM_MIN_COUNT;
  return Math.min(max, Math.max(LOREM_MIN_COUNT, n));
}

function pick(rng: () => number): string {
  return WORDS[Math.floor(rng() * WORDS.length)];
}

/** A single capitalized, period-terminated sentence of `words` words. */
function buildSentence(words: string[]): string {
  const joined = words.join(" ");
  return joined.charAt(0).toUpperCase() + joined.slice(1) + ".";
}

/**
 * Generate placeholder lorem ipsum.
 *
 * Robustness contract (the component clamps too, but this stays defensive):
 *  - count is truncated and clamped into [MIN, max-for-unit] so it can never
 *    allocate an unbounded string.
 *  - `unit` selects words / sentences / paragraphs.
 *  - `startWithLorem` forces the canonical "Lorem ipsum dolor sit amet" prefix
 *    on the first sentence (words mode prefixes the leading words).
 *
 * `rng` defaults to Math.random; tests inject a deterministic source.
 */
export function generateLorem(
  opts: LoremOptions,
  rng: () => number = Math.random,
): string {
  const { unit, startWithLorem } = opts;
  const count = clampCount(opts.count, unit);

  if (unit === "words") {
    const words: string[] = [];
    if (startWithLorem) {
      words.push(...LOREM_OPENER.slice(0, count));
    }
    while (words.length < count) words.push(pick(rng));
    if (words.length === 0) return "";
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
  }

  if (unit === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      const len = 8 + Math.floor(rng() * 10);
      const words = Array.from({ length: len }, () => pick(rng));
      if (i === 0 && startWithLorem) words.splice(0, LOREM_OPENER.length, ...LOREM_OPENER);
      sentences.push(buildSentence(words));
    }
    return sentences.join(" ");
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentenceCount = 3 + Math.floor(rng() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentenceCount; s++) {
      const len = 7 + Math.floor(rng() * 12);
      const words = Array.from({ length: len }, () => pick(rng));
      if (p === 0 && s === 0 && startWithLorem) {
        words.splice(0, LOREM_OPENER.length, ...LOREM_OPENER);
      }
      sentences.push(buildSentence(words));
    }
    paragraphs.push(sentences.join(" "));
  }
  return paragraphs.join("\n\n");
}
