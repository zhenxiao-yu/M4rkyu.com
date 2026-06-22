// Pure Morse codec shared by the morse tool. No React, no DOM —
// unit-tested in tests/unit/tools/morse.test.ts.
//
// Conventions (ITU-ish):
//   • letters within a word are separated by a single space
//   • words are separated by " / " (slash, space-padded on output)
//   • newlines are preserved as line breaks in both directions
//
// Both directions are total: they never throw. Unmappable input degrades to a
// single "?" placeholder rather than being silently dropped, so the user can
// see *where* something failed instead of getting truncated output.

/** The single placeholder for any character/sequence we can't map. */
export const MORSE_UNKNOWN = "?";

/** Letter → dot/dash table (uppercase keys). Source of truth for both maps. */
export const MORSE_TABLE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....",
  7: "--...", 8: "---..", 9: "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "'": ".----.", "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...",
  ":": "---...", ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-",
  '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};

/** dot/dash → letter, derived from MORSE_TABLE. */
export const MORSE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_TABLE).map(([k, v]) => [v, k]),
);

/**
 * Text → Morse. Case-insensitive. Letters joined by a single space, words by
 * " / ", lines preserved. Unknown characters become "?" so output length
 * tracks input rather than silently collapsing.
 */
export function textToMorse(text: string): string {
  if (text === "") return "";
  return text
    .toUpperCase()
    .split("\n")
    .map((line) =>
      // Collapse runs of spaces so accidental double-spaces don't emit empty
      // words ("/ /"); trim so leading/trailing spaces don't either.
      line
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .map((word) =>
          Array.from(word)
            .map((ch) => MORSE_TABLE[ch] ?? MORSE_UNKNOWN)
            .join(" "),
        )
        .join(" / "),
    )
    .join("\n");
}

/**
 * Morse → text. Tolerant of irregular spacing: any run of whitespace separates
 * letters, and "/" (with or without surrounding spaces) separates words. Lines
 * are preserved. Unknown dot/dash sequences become "?". A bare "/" with no
 * symbols around it collapses to a single space rather than a spurious "?".
 */
export function morseToText(morse: string): string {
  if (morse === "") return "";
  return morse
    .split("\n")
    .map((line) =>
      line
        // Word boundary: a slash, optionally padded by whitespace. We normalize
        // it to a control char first so the symbol split below can stay simple.
        .split(/\s*\/\s*/)
        .map((word) =>
          word
            .trim()
            .split(/\s+/)
            .filter((sym) => sym.length > 0)
            .map((sym) => MORSE_REVERSE[sym] ?? MORSE_UNKNOWN)
            .join(""),
        )
        .join(" "),
    )
    .join("\n");
}

export type MorseMode = "encode" | "decode";

/** Run a single pass. Empty input is a valid empty state, never an error. */
export function runMorse(
  input: string,
  mode: MorseMode,
): { output: string; empty: boolean } {
  if (input === "") return { output: "", empty: true };
  return {
    output: mode === "encode" ? textToMorse(input) : morseToText(input),
    empty: false,
  };
}
