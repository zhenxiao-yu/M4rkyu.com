// Pure text-counting logic shared by the word-counter tool. No React, no DOM —
// unit-tested in tests/unit/tools/word-counter.test.ts.
//
// Counting is code-point aware on purpose. `String.prototype.length` counts
// UTF-16 code units, so an astral-plane emoji like "😀" (one user-perceived
// character) reports as length 2, and "👨‍👩‍👧" (a ZWJ family sequence) reports
// even larger. We iterate with the string iterator (`[...text]` /
// `Array.from`), which yields whole code points, so emoji and CJK ideographs
// each count as one character.
//
// CJK has no inter-word spaces, so whitespace-splitting would count a whole
// sentence as a single "word". We count CJK ideographs individually as words
// AND as characters, then add whitespace-delimited runs of non-CJK text — so
// mixed "Hello 世界" reads as 1 + 2 = 3 words, which matches how CJK word
// counters (e.g. word processors) behave.

export interface TextCounts {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

// CJK Unified Ideographs (+ Ext A), Hiragana, Katakana, Hangul syllables, and
// CJK punctuation that should not be glued onto an adjacent ideograph. Each
// such code point is its own "word" the way CJK counters treat it.
const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/u;

// Sentence terminators across Latin + CJK (。！？、…) plus the ASCII set.
const SENTENCE_TERMINATOR = /[.!?。！？…]/u;

const EMPTY: TextCounts = {
  words: 0,
  characters: 0,
  charactersNoSpaces: 0,
  sentences: 0,
  paragraphs: 0,
  lines: 0,
};

/**
 * Count words, characters, sentences, paragraphs, and lines in a single pass
 * over the text's code points. Returns all-zeros for empty input.
 *
 * - characters: every code point (emoji = 1, CJK = 1).
 * - charactersNoSpaces: code points excluding any whitespace.
 * - words: whitespace-delimited runs of non-CJK text + each CJK code point.
 * - sentences: runs ending in a terminator (`. ! ? 。 ！ ？ …`).
 * - paragraphs: blank-line-separated, non-empty blocks.
 * - lines: newline-separated lines (a single non-empty line counts as 1).
 */
export function countText(text: string): TextCounts {
  if (text === "") return { ...EMPTY };

  let characters = 0;
  let charactersNoSpaces = 0;
  let words = 0;
  let inLatinWord = false;
  let sentences = 0;
  let pendingSentence = false; // saw non-terminator content since last terminator

  // Single pass over code points.
  for (const ch of text) {
    characters += 1;

    const isWhitespace = /\s/u.test(ch);
    if (!isWhitespace) charactersNoSpaces += 1;

    if (CJK.test(ch)) {
      // Each CJK code point is its own word; it also breaks any Latin run.
      words += 1;
      inLatinWord = false;
    } else if (isWhitespace) {
      inLatinWord = false;
    } else if (!inLatinWord) {
      // Start of a new Latin/other word.
      words += 1;
      inLatinWord = true;
    }

    if (SENTENCE_TERMINATOR.test(ch)) {
      if (pendingSentence) {
        sentences += 1;
        pendingSentence = false;
      }
    } else if (!isWhitespace) {
      pendingSentence = true;
    }
  }

  // A trailing run with content but no terminator still reads as one sentence.
  if (pendingSentence) sentences += 1;

  const lines = text.split(/\r\n|\r|\n/).length;

  const paragraphs = text
    .split(/(?:\r\n|\r|\n){2,}/)
    .filter((block) => block.trim() !== "").length;

  return { words, characters, charactersNoSpaces, sentences, paragraphs, lines };
}

/**
 * Estimate reading time in whole minutes at `wpm` words per minute, floored to
 * a minimum of 1 minute for any non-empty text (so short notes don't read as
 * "0 min"). Empty text is 0.
 */
export function readingMinutes(words: number, wpm = 200): number {
  if (words <= 0) return 0;
  return Math.max(1, Math.ceil(words / wpm));
}
