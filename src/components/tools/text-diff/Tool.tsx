"use client";

import { useMemo, useState } from "react";

type Op = "equal" | "add" | "remove";
interface DiffLine {
  op: Op;
  text: string;
}

// LCS-driven line diff. Quadratic in line count — fine for the
// thousand-line inputs this tool sees in practice; never runs in
// hot paths.
function diffLines(a: string[], b: string[]): DiffLine[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
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

export function TextDiff() {
  const [a, setA] = useState("the quick brown fox\njumps over the lazy dog\n");
  const [b, setB] = useState("the slow brown fox\njumps over the lazy cat\n");

  const lines = useMemo(() => diffLines(a.split("\n"), b.split("\n")), [a, b]);
  const adds = lines.filter((l) => l.op === "add").length;
  const removes = lines.filter((l) => l.op === "remove").length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <Pane label="Original" value={a} onChange={setA} />
        <Pane label="Changed" value={b} onChange={setB} />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-mono uppercase tracking-[0.18em]">Diff</span>
        <span className="font-mono"><span className="text-emerald-500">+{adds}</span> · <span className="text-rose-500">-{removes}</span></span>
      </div>
      <pre className="overflow-auto rounded-md border border-border bg-card/40 font-mono text-xs leading-5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.op === "add"
                ? "bg-emerald-500/10 px-3 py-0.5"
                : line.op === "remove"
                  ? "bg-rose-500/10 px-3 py-0.5"
                  : "px-3 py-0.5 text-muted-foreground"
            }
          >
            <span className="mr-2 select-none text-muted-foreground/60">
              {line.op === "add" ? "+" : line.op === "remove" ? "-" : " "}
            </span>
            {line.text || " "}
          </div>
        ))}
      </pre>
    </div>
  );
}

function Pane({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
    </label>
  );
}
