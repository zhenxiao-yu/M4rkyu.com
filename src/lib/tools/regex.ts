// Pure regex-matching logic shared by the regex-tester tool. No React, no
// DOM — unit-tested in tests/unit/tools/regex.test.ts.
//
// `new RegExp(pattern, flags)` throws `SyntaxError` on an invalid pattern or
// an unsupported flag combo. We catch that and return a typed result so the
// UI can show a localized error instead of crashing.
//
// The global-flag path walks `exec` manually so we can hard-stop a zero-width
// match (e.g. `(?:)`, `a*`, `^`, `\b`) from pinning `lastIndex` and spinning
// forever — `matchAll` handles this internally, but doing it ourselves keeps
// the loop guard explicit and lets us cap total matches.

export interface RegexMatch {
  index: number;
  value: string;
  groups: string[];
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[] }
  | { ok: false; error: string };

/** Upper bound on collected matches — guards pathological global patterns
 *  against unbounded memory/time without pulling in a heavy ReDoS dep. */
const MAX_MATCHES = 10_000;

/**
 * Compile `pattern` with `flags` and run it against `text`. Empty pattern is
 * a valid, no-match state. An invalid pattern or bad flag yields
 * `{ ok: false, error }` rather than throwing. The global path always makes
 * forward progress, so a zero-width match can never infinite-loop.
 */
export function runRegex(
  pattern: string,
  flags: string,
  text: string,
): RegexResult {
  if (!pattern) return { ok: true, matches: [] };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const matches: RegexMatch[] = [];

  if (!re.global) {
    const m = re.exec(text);
    if (m) matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
    return { ok: true, matches };
  }

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
    // Zero-width match: advance lastIndex by one so the loop makes progress
    // instead of re-matching the same empty span forever.
    if (m[0] === "") re.lastIndex += 1;
    if (matches.length >= MAX_MATCHES) break;
  }
  return { ok: true, matches };
}
