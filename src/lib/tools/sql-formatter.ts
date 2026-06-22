// Pure, dependency-free SQL pretty-printer shared by the sql-formatter tool.
// No React, no DOM — unit-tested in tests/unit/tools/sql-formatter.test.ts.
//
// This is a token-level formatter, NOT a real parser. It aims for "good enough
// to read" on hand-pasted queries: it uppercases (or lowercases) reserved
// keywords, breaks before major clauses, indents nested parens, and puts each
// comma-separated item on its own line. It is intentionally total — every entry
// point is wrapped so malformed or partial SQL falls back to the original
// input rather than throwing. String/identifier literals and line/block
// comments are tokenized as opaque atoms so their contents are never reflowed
// or re-cased.

/** Reserved words we recognise — lower-case canonical form is the lookup key. */
const KEYWORDS = new Set<string>([
  "select",
  "from",
  "where",
  "and",
  "or",
  "not",
  "in",
  "is",
  "null",
  "true",
  "false",
  "as",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "full",
  "cross",
  "on",
  "using",
  "group",
  "by",
  "having",
  "order",
  "asc",
  "desc",
  "limit",
  "offset",
  "insert",
  "into",
  "values",
  "update",
  "set",
  "delete",
  "create",
  "alter",
  "drop",
  "table",
  "view",
  "index",
  "if",
  "exists",
  "primary",
  "key",
  "foreign",
  "references",
  "constraint",
  "default",
  "with",
  "returning",
  "union",
  "intersect",
  "except",
  "all",
  "distinct",
  "case",
  "when",
  "then",
  "else",
  "end",
  "between",
  "like",
  "ilike",
  "any",
  "some",
]);

/** Clauses that start a new line at the current indent depth. */
const BREAK_BEFORE = new Set<string>([
  "select",
  "from",
  "where",
  "group",
  "having",
  "order",
  "limit",
  "offset",
  "values",
  "set",
  "returning",
  "union",
  "intersect",
  "except",
  "with",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "full",
  "cross",
]);

export type KeywordCase = "upper" | "lower" | "preserve";

export interface FormatSqlOptions {
  /** How reserved keywords are cased. Default `"upper"`. */
  keywordCase?: KeywordCase;
  /** Spaces per indent level. Default `2`. */
  indentSize?: number;
}

export interface FormatSqlResult {
  /** Formatted SQL, or the original input if formatting was skipped/failed. */
  output: string;
  /** No usable input — a valid resting state, not an error. */
  empty: boolean;
  /** Formatting threw and we fell back to the raw input. */
  fallback: boolean;
}

type TokenKind = "word" | "punct" | "string" | "comment";
interface Token {
  kind: TokenKind;
  value: string;
}

/**
 * Split SQL into atoms. Strings ('…', "…", `…`), line comments (-- …) and
 * block comments (/* … *\/) are captured whole so their contents are never
 * reformatted or re-cased. Parens and commas are individual punctuation
 * tokens; everything else is collapsed into whitespace-delimited words.
 */
function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = sql.length;
  let word = "";

  const flushWord = () => {
    if (word) {
      tokens.push({ kind: "word", value: word });
      word = "";
    }
  };

  while (i < n) {
    const ch = sql[i];

    // String literals — single, double, or backtick quoted. SQL escapes a
    // quote by doubling it, so a doubled quote stays inside the literal.
    if (ch === "'" || ch === '"' || ch === "`") {
      flushWord();
      const quote = ch;
      let lit = ch;
      i++;
      while (i < n) {
        const c = sql[i];
        lit += c;
        if (c === quote) {
          if (sql[i + 1] === quote) {
            lit += quote;
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      tokens.push({ kind: "string", value: lit });
      continue;
    }

    // Line comment — runs to end of line.
    if (ch === "-" && sql[i + 1] === "-") {
      flushWord();
      let cmt = "";
      while (i < n && sql[i] !== "\n") {
        cmt += sql[i];
        i++;
      }
      tokens.push({ kind: "comment", value: cmt });
      continue;
    }

    // Block comment — runs to the closing */ (or end of input).
    if (ch === "/" && sql[i + 1] === "*") {
      flushWord();
      let cmt = "/*";
      i += 2;
      while (i < n) {
        if (sql[i] === "*" && sql[i + 1] === "/") {
          cmt += "*/";
          i += 2;
          break;
        }
        cmt += sql[i];
        i++;
      }
      tokens.push({ kind: "comment", value: cmt });
      continue;
    }

    if (ch === "(" || ch === ")" || ch === ",") {
      flushWord();
      tokens.push({ kind: "punct", value: ch });
      i++;
      continue;
    }

    if (/\s/.test(ch)) {
      flushWord();
      i++;
      continue;
    }

    word += ch;
    i++;
  }
  flushWord();
  return tokens;
}

function applyKeywordCase(word: string, mode: KeywordCase): string {
  const lower = word.toLowerCase();
  if (!KEYWORDS.has(lower)) return word;
  if (mode === "upper") return lower.toUpperCase();
  if (mode === "lower") return lower;
  return word;
}

/**
 * Core formatter. Pure and total in practice, but {@link formatSql} still
 * guards it so any future edge case degrades to the raw input.
 */
function formatTokens(tokens: Token[], options: Required<FormatSqlOptions>): string {
  const pad = (level: number) =>
    " ".repeat(Math.max(0, level) * options.indentSize);

  let out = "";
  let depth = 0;
  let firstClause = true;
  /** True when the cursor sits at the start of a fresh line (post-break/paren). */
  let atLineStart = true;

  const append = (text: string, { space }: { space: boolean }) => {
    if (atLineStart) out += text;
    else out += (space ? " " : "") + text;
    atLineStart = false;
  };

  for (const tok of tokens) {
    if (tok.kind === "punct" && tok.value === "(") {
      append("(", { space: true });
      depth++;
      continue;
    }
    if (tok.kind === "punct" && tok.value === ")") {
      depth = Math.max(0, depth - 1);
      append(")", { space: false });
      continue;
    }
    if (tok.kind === "punct" && tok.value === ",") {
      out += ",\n" + pad(depth + 1);
      atLineStart = true;
      continue;
    }

    const lower = tok.kind === "word" ? tok.value.toLowerCase() : "";
    if (tok.kind === "word" && BREAK_BEFORE.has(lower)) {
      if (!firstClause) {
        out += "\n" + pad(depth);
        atLineStart = true;
      }
      append(applyKeywordCase(tok.value, options.keywordCase), { space: true });
      firstClause = false;
      continue;
    }

    if (tok.kind === "word") {
      append(applyKeywordCase(tok.value, options.keywordCase), { space: true });
    } else {
      // string or comment — emit verbatim
      append(tok.value, { space: true });
    }
  }

  return out
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/[ \t]+,/g, ",")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * Format a SQL string. Never throws: empty input returns an empty,
 * non-error result, and any internal failure falls back to the original
 * input with `fallback: true` so the caller can surface a localized note.
 */
export function formatSql(
  input: string,
  options: FormatSqlOptions = {},
): FormatSqlResult {
  const resolved: Required<FormatSqlOptions> = {
    keywordCase: options.keywordCase ?? "upper",
    indentSize: Number.isFinite(options.indentSize)
      ? Math.max(0, Math.trunc(options.indentSize as number))
      : 2,
  };

  if (!input || !input.trim()) {
    return { output: "", empty: true, fallback: false };
  }

  try {
    const trimmed = input.replace(/;\s*$/, "");
    const tokens = tokenize(trimmed);
    const body = formatTokens(tokens, resolved);
    const output = body ? body + ";" : input;
    return { output, empty: false, fallback: false };
  } catch {
    return { output: input, empty: false, fallback: true };
  }
}
