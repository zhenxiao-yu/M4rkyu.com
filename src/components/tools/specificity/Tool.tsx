"use client";

import { useMemo, useState } from "react";

type Triple = [number, number, number];

interface Part {
  text: string;
  col: 0 | 1 | 2 | 3 | -1; // 0 = none, 1/2/3 = a/b/c, -1 = nested (:is/:not/:has)
}

const LEGACY_PSEUDO_ELEMENTS = new Set([
  "before",
  "after",
  "first-line",
  "first-letter",
]);

function readIdent(s: string, start: number): { text: string; end: number } {
  let i = start;
  while (i < s.length && /[\w-]/.test(s[i])) i++;
  return { text: s.slice(start, i), end: i };
}

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

function add(t: Triple, o: Triple): Triple {
  return [t[0] + o[0], t[1] + o[1], t[2] + o[2]];
}
function gt(x: Triple, y: Triple): boolean {
  return x[0] !== y[0] ? x[0] > y[0] : x[1] !== y[1] ? x[1] > y[1] : x[2] > y[2];
}

// Specificity of the most specific selector in a comma list — the rule
// for the argument of :is() / :not() / :has().
function maxOfList(list: string): Triple {
  let best: Triple = [0, 0, 0];
  for (const sel of splitTopLevel(list)) {
    const t = computeTriple(sel);
    if (gt(t, best)) best = t;
  }
  return best;
}

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

function tokenize(selector: string): { triple: Triple; parts: Part[] } {
  const s = selector;
  const parts: Part[] = [];
  let t: Triple = [0, 0, 0];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    if (ch === "#") {
      const m = readIdent(s, i + 1);
      t = add(t, [1, 0, 0]);
      parts.push({ text: "#" + m.text, col: 1 });
      i = m.end;
    } else if (ch === ".") {
      const m = readIdent(s, i + 1);
      t = add(t, [0, 1, 0]);
      parts.push({ text: "." + m.text, col: 2 });
      i = m.end;
    } else if (ch === "[") {
      const end = s.indexOf("]", i);
      const stop = end >= 0 ? end + 1 : s.length;
      t = add(t, [0, 1, 0]);
      parts.push({ text: s.slice(i, stop), col: 2 });
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
      if (isDouble || (!isDouble && LEGACY_PSEUDO_ELEMENTS.has(name))) {
        t = add(t, [0, 0, 1]);
        parts.push({ text: full, col: 3 });
      } else if (name === "where") {
        parts.push({ text: full, col: 0 });
      } else if (name === "is" || name === "not" || name === "has") {
        t = add(t, maxOfList(args ?? ""));
        parts.push({ text: full, col: -1 });
      } else {
        t = add(t, [0, 1, 0]);
        parts.push({ text: full, col: 2 });
      }
      i = j;
    } else if (ch === "*") {
      parts.push({ text: "*", col: 0 });
      i++;
    } else if (/[a-zA-Z\\]/.test(ch)) {
      const m = readIdent(s, i);
      const text = m.text || ch;
      t = add(t, [0, 0, 1]);
      parts.push({ text, col: 3 });
      i = m.end > i ? m.end : i + 1;
    } else {
      // combinator / whitespace / comma — zero specificity
      i++;
    }
  }
  return { triple: t, parts };
}

function computeTriple(selector: string): Triple {
  return tokenize(selector).triple;
}

const COL_STYLE: Record<number, string> = {
  1: "border-signal/40 bg-signal/10 text-signal",
  2: "border-ring/40 bg-ring/10 text-ring",
  3: "border-success/40 bg-success/10 text-success",
  0: "border-border bg-muted/30 text-muted-foreground",
  [-1]: "border-warning/40 bg-warning/10 text-warning",
};

const EXAMPLES = [
  "#nav .item a:hover",
  "ul li::before",
  "a:not(.btn, #x)",
  ".card:is(.a .b, #c)",
  ":where(.reset) .title",
];

export function Specificity() {
  const [input, setInput] = useState("#nav .item a:hover");

  const { triple, parts } = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { triple: [0, 0, 0] as Triple, parts: [] as Part[] };
    // Score the most specific selector when a list is pasted.
    const selectors = splitTopLevel(trimmed);
    let best = tokenize(selectors[0] ?? "");
    for (const sel of selectors.slice(1)) {
      const next = tokenize(sel);
      if (gt(next.triple, best.triple)) best = next;
    }
    return best;
  }, [input]);

  return (
    <div className="grid gap-5">
      <input
        type="text"
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="#nav .item a:hover"
        className="w-full rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm"
      />

      {/* Big (a, b, c) readout. */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { label: "IDs", v: triple[0], col: 1 },
            { label: "Classes · attrs · pseudo-class", v: triple[1], col: 2 },
            { label: "Elements · pseudo-elements", v: triple[2], col: 3 },
          ] as const
        ).map((c) => (
          <div
            key={c.label}
            className={`grid place-items-center gap-1 rounded-lg border p-4 text-center ${COL_STYLE[c.col]}`}
          >
            <span className="font-display text-4xl font-black tabular-nums leading-none">
              {c.v}
            </span>
            <span className="font-mono text-[0.55rem] uppercase leading-tight tracking-[0.12em] opacity-80">
              {c.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-center font-mono text-sm text-muted-foreground">
        specificity ={" "}
        <span className="text-foreground">
          ({triple[0]}, {triple[1]}, {triple[2]})
        </span>
      </p>

      {/* Token breakdown. */}
      {parts.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {parts.map((p, i) => (
            <span
              key={i}
              className={`rounded-md border px-2 py-1 font-mono text-xs ${COL_STYLE[p.col]}`}
            >
              {p.text}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Try
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setInput(ex)}
            className="rounded-md border border-border px-2 py-1 font-mono text-[0.7rem] text-muted-foreground transition-colors duration-(--motion-fast) hover:border-foreground/40 hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>
      <p className="font-mono text-[0.6rem] leading-relaxed text-muted-foreground">
        :is() / :not() / :has() take their most specific argument; :where()
        and the universal selector contribute nothing. Combinators never add
        specificity.
      </p>
    </div>
  );
}
