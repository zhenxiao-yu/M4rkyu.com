// Pure ASCII-art banner renderer shared by the ascii-art tool. No React, no
// DOM — unit-tested in tests/unit/tools/ascii-art.test.ts.
//
// `renderAsciiArt` is total: it never throws. The job is to turn arbitrary
// human text into a 5-row block banner, surviving real-world input — mixed
// case (folded to upper), characters outside the font (rendered as blank
// space rather than crashing), empty input ("" → ""), and oversized input
// (capped to ASCII_ART_MAX_LENGTH so a paste can't freeze the UI).

/** Hard cap on input length — beyond this the banner gets too wide to be
 * useful and large inputs risk janking the render. The UI surfaces a note. */
export const ASCII_ART_MAX_LENGTH = 50;

/** Default fill glyph painted in place of the font's `#` cells. */
export const ASCII_ART_DEFAULT_FILL = "█";

/** Rows per glyph — the font is a fixed 5-row block font. */
export const ASCII_ART_ROWS = 5;

// Minimal 5-row block font — A-Z + 0-9 + space. Each glyph is 5 chars wide.
// Compact by design; characters not in the map render as blank space.
const FONT: Record<string, readonly string[]> = {
  A: [" ### ", "#   #", "#####", "#   #", "#   #"],
  B: ["#### ", "#   #", "#### ", "#   #", "#### "],
  C: [" ####", "#    ", "#    ", "#    ", " ####"],
  D: ["#### ", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "###  ", "#    ", "#####"],
  F: ["#####", "#    ", "###  ", "#    ", "#    "],
  G: [" ####", "#    ", "#  ##", "#   #", " ####"],
  H: ["#   #", "#   #", "#####", "#   #", "#   #"],
  I: [" ### ", "  #  ", "  #  ", "  #  ", " ### "],
  J: ["  ###", "    #", "    #", "#   #", " ### "],
  K: ["#   #", "#  # ", "###  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "#   #", "#   #"],
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#### ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#  # ", " ## #"],
  R: ["#### ", "#   #", "#### ", "#  # ", "#   #"],
  S: [" ####", "#    ", " ### ", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "# # #", "## ##", "#   #"],
  X: ["#   #", " # # ", "  #  ", " # # ", "#   #"],
  Y: ["#   #", " # # ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "   # ", "  #  ", " #   ", "#####"],
  "0": [" ### ", "#   #", "#   #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "   # ", "  #  ", "#####"],
  "3": [" ### ", "#   #", "  ## ", "#   #", " ### "],
  "4": ["#   #", "#   #", "#####", "    #", "    #"],
  "5": ["#####", "#    ", "#### ", "    #", "#### "],
  "6": [" ### ", "#    ", "#### ", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "  #  ", " #   "],
  "8": [" ### ", "#   #", " ### ", "#   #", " ### "],
  "9": [" ### ", "#   #", " ####", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     "],
};

const BLANK_ROW = ["     ", "     ", "     ", "     ", "     "] as const;

/** True for characters the font can render (the rest fall back to blank). */
export function isSupportedChar(ch: string): boolean {
  return ch.toUpperCase() in FONT;
}

export interface AsciiArtOptions {
  /** Single glyph painted where the font has a `#` cell. Default `"█"`. */
  fill?: string;
  /** Hard cap on rendered characters. Default `ASCII_ART_MAX_LENGTH`. */
  maxLength?: number;
}

export interface AsciiArtResult {
  /** The rendered 5-row banner, or "" when there is nothing to draw. */
  art: string;
  /** True when the trimmed input produced no banner — a valid state. */
  empty: boolean;
  /** True when the input exceeded `maxLength` and was truncated. */
  truncated: boolean;
}

/**
 * Turn text into a 5-row ASCII-art banner. Total: never throws.
 *
 * The input is upper-cased, truncated to `maxLength`, and each character is
 * looked up in the block font — unsupported characters render as blank space
 * so unexpected input degrades gracefully instead of crashing. The `#` cells
 * are painted with `fill` (first glyph of the supplied string; `#` fallback).
 */
export function renderAsciiArt(
  text: string,
  options: AsciiArtOptions = {},
): string {
  const maxLength = options.maxLength ?? ASCII_ART_MAX_LENGTH;
  const fill = Array.from(options.fill ?? ASCII_ART_DEFAULT_FILL)[0] ?? "#";

  const chars = Array.from(text).slice(0, Math.max(0, maxLength));
  if (chars.length === 0) return "";

  const glyphs = chars.map((ch) => FONT[ch.toUpperCase()] ?? BLANK_ROW);
  const rows: string[] = [];
  for (let r = 0; r < ASCII_ART_ROWS; r++) {
    rows.push(glyphs.map((g) => g[r]).join("  "));
  }
  // Paint the fill last so a multi-char `#`-bearing fill can't corrupt layout.
  return rows.join("\n").split("#").join(fill);
}

/**
 * Convenience wrapper pairing the banner with `empty` / `truncated` flags for
 * the UI. Trims the input first so whitespace-only text reads as empty.
 */
export function runAsciiArt(
  text: string,
  options: AsciiArtOptions = {},
): AsciiArtResult {
  const maxLength = options.maxLength ?? ASCII_ART_MAX_LENGTH;
  const trimmed = text.trim();
  const truncated = Array.from(text).length > maxLength;
  const art = renderAsciiArt(text, { ...options, maxLength });
  return { art, empty: trimmed.length === 0, truncated };
}
