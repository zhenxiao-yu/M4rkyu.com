// Pure line-diff logic shared by the text-diff tool. No React, no DOM —
// unit-tested in tests/unit/tools/text-diff.test.ts.
//
// The diff is an LCS (longest common subsequence) over *lines*. LCS is
// O(n·m) in time and memory, so a naive build of the full DP table is fine
// for the few-hundred-line inputs this tool sees but pathological for huge
// pastes (10k × 10k lines = 100M cells → multi-hundred-MB allocation and a
// frozen tab). `diffText` therefore caps the work: past `MAX_DIFF_LINES`
// total lines it returns a `truncated` flag instead of grinding, and the UI
// surfaces a localized note. Below the cap the result is an exact LCS diff.

export type DiffOp = "equal" | "add" | "remove";

export interface DiffLine {
  op: DiffOp;
  /** The line text (without its newline). */
  text: string;
}

export interface DiffResult {
  lines: DiffLine[];
  /** Lines present only in the changed side. */
  additions: number;
  /** Lines present only in the original side. */
  deletions: number;
  /** Both sides reduce to the same line list — no differences. */
  identical: boolean;
  /** Both inputs were empty. */
  empty: boolean;
  /** Input exceeded `MAX_DIFF_LINES`; the diff was skipped to stay responsive. */
  truncated: boolean;
}

/**
 * Combined line budget across both inputs. Above this we skip the quadratic
 * LCS rather than freeze the tab. ~4000 total lines keeps the worst-case DP
 * table (≈2000 × 2000 ≈ 4M cells) comfortably bounded.
 */
export const MAX_DIFF_LINES = 4000;

/**
 * Split text into lines for diffing. We deliberately keep this trivial
 * (`split("\n")`) and normalize CRLF first so a Windows-vs-Unix newline
 * difference doesn't flag every line as changed. A trailing newline yields a
 * final empty line — that's intentional, so "foo\n" vs "foo" reads as one
 * real difference rather than silently equal.
 */
export function splitLines(text: string): string[] {
  return text.replace(/\r\n/g, "\n").split("\n");
}

/** LCS-driven line diff. O(n·m); callers must bound the input. */
export function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;

  // DP table of LCS lengths. Row-major; dp[i][j] = LCS(a[0..i), b[0..j)).
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack from the bottom-right to recover the edit script.
  const out: DiffLine[] = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.unshift({ op: "equal", text: a[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.unshift({ op: "remove", text: a[i - 1] });
      i--;
    } else {
      out.unshift({ op: "add", text: b[j - 1] });
      j--;
    }
  }
  while (i > 0) out.unshift({ op: "remove", text: a[--i] });
  while (j > 0) out.unshift({ op: "add", text: b[--j] });
  return out;
}

/**
 * Diff two whole texts. Total — never throws. Distinguishes three states the
 * UI cares about: both empty (`empty`), no differences (`identical`), and a
 * real diff. Caps pathological input at `MAX_DIFF_LINES` (`truncated`) so a
 * huge paste can't freeze the tab.
 */
export function diffText(original: string, changed: string): DiffResult {
  const a = splitLines(original);
  const b = splitLines(changed);

  const empty = original === "" && changed === "";
  if (empty) {
    return {
      lines: [],
      additions: 0,
      deletions: 0,
      identical: true,
      empty: true,
      truncated: false,
    };
  }

  if (a.length + b.length > MAX_DIFF_LINES) {
    return {
      lines: [],
      additions: 0,
      deletions: 0,
      identical: original === changed,
      empty: false,
      truncated: true,
    };
  }

  const lines = diffLines(a, b);
  let additions = 0;
  let deletions = 0;
  for (const line of lines) {
    if (line.op === "add") additions++;
    else if (line.op === "remove") deletions++;
  }

  return {
    lines,
    additions,
    deletions,
    identical: additions === 0 && deletions === 0,
    empty: false,
    truncated: false,
  };
}

/** A unified-diff-style plain-text rendering, suitable for the clipboard. */
export function formatDiff(lines: DiffLine[]): string {
  return lines
    .map((line) => {
      const sign = line.op === "add" ? "+" : line.op === "remove" ? "-" : " ";
      return `${sign} ${line.text}`;
    })
    .join("\n");
}
