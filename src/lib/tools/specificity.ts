// Pure CSS selector specificity calculator. No React, no DOM — unit-tested in
// tests/unit/tools/specificity.test.ts. The specificity Tool renders the live
// (a, b, c) readout and the per-token breakdown straight from these functions,
// so the displayed score and the copied value can never drift from each other.
//
// Specificity is the triple (a, b, c):
//   a — ID selectors                              (#id)
//   b — classes, attributes, pseudo-classes       (.foo, [attr], :hover)
//   c — type (element) selectors, pseudo-elements  (div, ::before)
// The universal selector (*) and combinators (> + ~ and descendant space) add
// nothing. :where() always contributes 0. :is(), :not(), and :has() contribute
// the specificity of their *most specific* argument.

/** A specificity score as the canonical (a, b, c) triple. */
export interface Specificity {
  /** ID selectors. */
  a: number;
  /** Classes, attribute selectors, and pseudo-classes. */
  b: number;
  /** Type (element) selectors and pseudo-elements. */
  c: number;
}

/** Which specificity column a token contributes to (for the UI breakdown). */
export type TokenColumn =
  | "a" // ID
  | "b" // class / attribute / pseudo-class
  | "c" // element / pseudo-element
  | "zero" // universal, combinator, :where()
  | "functional"; // :is() / :not() / :has() — folds in its argument's score

/** A single parsed chunk of the selector, for the visual breakdown. */
export interface SelectorToken {
  /** Verbatim source text of this token. */
  text: string;
  /** The specificity column this token feeds. */
  column: TokenColumn;
}

/** Full analysis: the score plus the ordered token breakdown. */
export interface SelectorAnalysis {
  score: Specificity;
  tokens: SelectorToken[];
}

const ZERO: Specificity = { a: 0, b: 0, c: 0 };

// Single-colon pseudos that are really pseudo-elements (CSS2 legacy syntax) and
// therefore score as elements (c), not pseudo-classes (b).
const LEGACY_PSEUDO_ELEMENTS = new Set([
  "before",
  "after",
  "first-line",
  "first-letter",
]);

function add(x: Specificity, y: Specificity): Specificity {
  return { a: x.a + y.a, b: x.b + y.b, c: x.c + y.c };
}

/** True when `x` is strictly more specific than `y`, comparing a, then b, then c. */
function isGreater(x: Specificity, y: Specificity): boolean {
  if (x.a !== y.a) return x.a > y.a;
  if (x.b !== y.b) return x.b > y.b;
  return x.c > y.c;
}

function readIdent(s: string, start: number): { text: string; end: number } {
  let i = start;
  // Consume an identifier, allowing CSS escapes (\.) inside it.
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      i += 2;
      continue;
    }
    if (/[\w-]/.test(s[i])) {
      i += 1;
      continue;
    }
    break;
  }
  return { text: s.slice(start, i), end: i };
}

/** Index of the `)` matching the `(` at `openIdx`; falls back to end of string. */
function matchParen(s: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return s.length;
}

/** Split a comma list at the top level only (respecting parens). */
function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) {
      out.push(s.slice(last, i));
      last = i + 1;
    }
  }
  out.push(s.slice(last));
  return out.filter((p) => p.trim().length > 0);
}

/** Highest specificity among a comma-separated argument list (:is / :not / :has). */
function maxOfList(list: string): Specificity {
  let best = ZERO;
  for (const sel of splitTopLevel(list)) {
    const t = analyzeCompound(sel).score;
    if (isGreater(t, best)) best = t;
  }
  return best;
}

/**
 * Analyze a single complex selector (one entry of a comma list). Walks the
 * string character by character and never throws — unrecognized characters
 * (combinators, whitespace, stray punctuation) simply contribute nothing.
 */
function analyzeCompound(selector: string): SelectorAnalysis {
  const s = selector;
  const tokens: SelectorToken[] = [];
  let score = ZERO;
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (ch === "#") {
      const m = readIdent(s, i + 1);
      // A lone "#" with no name is garbage — treat as zero, not an ID.
      if (m.text.length === 0) {
        i += 1;
        continue;
      }
      score = add(score, { a: 1, b: 0, c: 0 });
      tokens.push({ text: "#" + m.text, column: "a" });
      i = m.end;
    } else if (ch === ".") {
      const m = readIdent(s, i + 1);
      if (m.text.length === 0) {
        i += 1;
        continue;
      }
      score = add(score, { a: 0, b: 1, c: 0 });
      tokens.push({ text: "." + m.text, column: "b" });
      i = m.end;
    } else if (ch === "[") {
      const end = s.indexOf("]", i);
      const stop = end >= 0 ? end + 1 : s.length;
      score = add(score, { a: 0, b: 1, c: 0 });
      tokens.push({ text: s.slice(i, stop), column: "b" });
      i = stop;
    } else if (ch === ":") {
      const isDouble = s[i + 1] === ":";
      const start = i;
      let j = i + (isDouble ? 2 : 1);
      const m = readIdent(s, j);
      const name = m.text.toLowerCase();
      j = m.end;
      let args: string | null = null;
      if (s[j] === "(") {
        const close = matchParen(s, j);
        args = s.slice(j + 1, close);
        j = close + 1;
      }
      const full = s.slice(start, j);
      // A bare colon with no name is garbage.
      if (name.length === 0) {
        i = j > i ? j : i + 1;
        continue;
      }
      if (isDouble || LEGACY_PSEUDO_ELEMENTS.has(name)) {
        // Pseudo-element → element column.
        score = add(score, { a: 0, b: 0, c: 1 });
        tokens.push({ text: full, column: "c" });
      } else if (name === "where") {
        // :where() is always zero, regardless of its argument.
        tokens.push({ text: full, column: "zero" });
      } else if (name === "is" || name === "not" || name === "has") {
        score = add(score, maxOfList(args ?? ""));
        tokens.push({ text: full, column: "functional" });
      } else {
        // Ordinary pseudo-class → class column.
        score = add(score, { a: 0, b: 1, c: 0 });
        tokens.push({ text: full, column: "b" });
      }
      i = j;
    } else if (ch === "*") {
      tokens.push({ text: "*", column: "zero" });
      i += 1;
    } else if (/[a-zA-Z\\]/.test(ch)) {
      // Type (element) selector, possibly namespaced (svg|rect already handled
      // by the "|" falling through to the zero branch on the next pass).
      const m = readIdent(s, i);
      const text = m.text || ch;
      score = add(score, { a: 0, b: 0, c: 1 });
      tokens.push({ text, column: "c" });
      i = m.end > i ? m.end : i + 1;
    } else {
      // Combinator (> + ~), descendant whitespace, comma, or stray char — zero.
      i += 1;
    }
  }

  return { score, tokens };
}

/**
 * Analyze a full selector. When a comma-separated selector *list* is passed,
 * the most specific entry wins (its score and breakdown are returned), matching
 * how browsers evaluate which rule applies. Empty or whitespace-only input
 * yields a clean (0, 0, 0) with no tokens — never an error.
 */
export function analyzeSelector(selector: string): SelectorAnalysis {
  const trimmed = (selector ?? "").trim();
  if (!trimmed) return { score: ZERO, tokens: [] };

  const list = splitTopLevel(trimmed);
  let best = analyzeCompound(list[0] ?? "");
  for (const sel of list.slice(1)) {
    const next = analyzeCompound(sel);
    if (isGreater(next.score, best.score)) best = next;
  }
  return best;
}

/**
 * Specificity of a CSS selector as the canonical (a, b, c) triple. Pure and
 * total: any input (including empty, garbage, or a selector list) returns a
 * score without throwing.
 */
export function specificity(selector: string): Specificity {
  return analyzeSelector(selector).score;
}

/** Format a triple as the conventional `(a, b, c)` string. */
export function formatSpecificity({ a, b, c }: Specificity): string {
  return `(${a}, ${b}, ${c})`;
}
