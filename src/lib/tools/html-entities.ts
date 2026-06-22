// Pure HTML entity encode/decode logic shared by the html-entities tool. No
// React, no DOM — unit-tested in tests/unit/tools/html-entities.test.ts.
//
// Decode never touches innerHTML, so it cannot execute scripts or load
// resources from untrusted input. It resolves a small named-entity map plus
// numeric (&#nn;) and hex (&#xhh;) references with a single regex pass.

export type EntityMode = "encode" | "decode";

/** Output style for encode: human-readable named refs, or pure numeric. */
export type EntityStyle = "named" | "numeric";

/**
 * The five XML/HTML special characters that must always be escaped to keep
 * markup well-formed. `&` is intentionally first so callers iterating this map
 * don't double-escape, but we encode char-by-char so order is moot here.
 */
const NAMED_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Common named references we also recognise on decode (read-only direction). */
const NAMED_DECODE: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&mdash;": "—",
  "&ndash;": "–",
  "&hellip;": "…",
  "&middot;": "·",
  "&laquo;": "«",
  "&raquo;": "»",
  "&deg;": "°",
  "&euro;": "€",
  "&pound;": "£",
  "&cent;": "¢",
  "&yen;": "¥",
  "&sect;": "§",
  "&para;": "¶",
  "&bull;": "•",
  "&dagger;": "†",
  "&Dagger;": "‡",
  "&times;": "×",
  "&divide;": "÷",
  "&plusmn;": "±",
  "&micro;": "µ",
  "&frac12;": "½",
  "&frac14;": "¼",
  "&frac34;": "¾",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&larr;": "←",
  "&uarr;": "↑",
  "&rarr;": "→",
  "&darr;": "↓",
  "&harr;": "↔",
};

/**
 * Encode a string to HTML entities. Uses `Array.from` so astral-plane code
 * points (emoji, rare CJK) are iterated as whole characters rather than split
 * surrogate halves.
 *
 * - `named`: escape the five XML specials by name; everything else printable
 *   ASCII passes through; non-ASCII and control chars become numeric refs.
 * - `numeric`: escape the five specials and all non-ASCII / control chars as
 *   numeric refs, leaving the rest of printable ASCII untouched.
 */
export function encodeHtmlEntities(text: string, style: EntityStyle): string {
  if (text === "") return "";
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (style === "named" && NAMED_ESCAPES[ch]) {
      out += NAMED_ESCAPES[ch];
      continue;
    }
    if (NAMED_ESCAPES[ch]) {
      // numeric style still has to neutralise the five specials.
      out += `&#${code};`;
      continue;
    }
    if (code < 0x20 || code > 0x7e) {
      out += `&#${code};`;
      continue;
    }
    out += ch;
  }
  return out;
}

// Matches a named ref (&word;), a decimal numeric ref (&#123;), or a hex
// numeric ref (&#x1F600; / &#X1F600;). The hex branch is checked first inside
// the handler; HTML allows either letter case for the `x` marker.
const ENTITY_RE = /&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g;

/**
 * Decode HTML entities without any DOM access. Resolves named refs from the
 * map above and any numeric / hex character reference. Out-of-range or
 * malformed numeric refs (e.g. a code point above U+10FFFF) are left verbatim
 * rather than throwing.
 */
export function decodeHtmlEntities(text: string): string {
  if (text === "") return "";
  return text.replace(ENTITY_RE, (match, body: string) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const digits = isHex ? body.slice(2) : body.slice(1);
      const code = parseInt(digits, isHex ? 16 : 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return NAMED_DECODE[match] ?? match;
  });
}

export type EntityResult = { output: string; empty: boolean };

/**
 * Run one encode/decode pass. Empty input is a valid empty state, never an
 * error. Neither direction throws, so there is no error variant — malformed
 * fragments simply pass through on decode.
 */
export function runHtmlEntities(
  input: string,
  mode: EntityMode,
  style: EntityStyle,
): EntityResult {
  if (input === "") return { output: "", empty: true };
  const output =
    mode === "encode" ? encodeHtmlEntities(input, style) : decodeHtmlEntities(input);
  return { output, empty: false };
}
