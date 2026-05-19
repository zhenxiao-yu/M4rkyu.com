"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAGS)[number];

interface MatchInfo {
  index: number;
  value: string;
  groups: string[];
}

export function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [text, setText] = useState("Reach me at mark@m4rkyu.com or zyu347@uwo.ca.\nAlso valid: hello+spam@example.org");

  const result = useMemo(() => {
    if (!pattern) return { ok: true, matches: [] as MatchInfo[] };
    try {
      const re = new RegExp(pattern, Array.from(flags).join(""));
      const matches: MatchInfo[] = [];
      if (re.global) {
        for (const m of text.matchAll(re)) {
          matches.push({ index: m.index ?? 0, value: m[0], groups: m.slice(1) });
        }
      } else {
        const m = re.exec(text);
        if (m) matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
      }
      return { ok: true as const, matches };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, [pattern, flags, text]);

  function toggle(flag: Flag) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }

  // Highlight matches in the text — wraps each match in a <mark>.
  const highlighted = useMemo(() => {
    if (!result.ok || result.matches.length === 0) return text;
    const parts: ReactNode[] = [];
    let cursor = 0;
    result.matches.forEach((m, i) => {
      if (m.index > cursor) parts.push(text.slice(cursor, m.index));
      parts.push(
        <mark key={i} className="rounded-sm bg-ring/25 px-0.5 text-foreground">
          {m.value}
        </mark>,
      );
      cursor = m.index + m.value.length;
    });
    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
  }, [result, text]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-base text-muted-foreground">/</span>
        <Input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          className="flex-1 font-mono"
        />
        <span className="font-mono text-base text-muted-foreground">/</span>
        <div className="flex gap-1">
          {FLAGS.map((flag) => (
            <button
              key={flag}
              type="button"
              onClick={() => toggle(flag)}
              aria-pressed={flags.has(flag)}
              className={`grid size-7 place-items-center rounded-md border border-border font-mono text-xs ${flags.has(flag) ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground"}`}
            >
              {flag}
            </button>
          ))}
        </div>
        <Badge variant={result.ok ? "outline" : "outline"} className={`font-mono text-[0.6rem] ${result.ok ? "" : "border-destructive/40 text-destructive"}`}>
          {result.ok ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"}` : "invalid"}
        </Badge>
      </div>
      {!result.ok ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
          {result.error}
        </p>
      ) : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        spellCheck={false}
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <div className="rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs leading-6 whitespace-pre-wrap">
        {highlighted}
      </div>
      {result.ok && result.matches.length > 0 ? (
        <ul className="grid gap-1.5">
          {result.matches.map((m, i) => (
            <li key={i} className="rounded-md border border-border bg-card/40 px-3 py-2 text-xs">
              <div className="flex items-baseline justify-between gap-2">
                <code className="font-mono">{m.value}</code>
                <span className="font-mono text-[0.6rem] text-muted-foreground">at index {m.index}</span>
              </div>
              {m.groups.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-1">
                  {m.groups.map((g, gi) => (
                    <Badge key={gi} variant="outline" className="font-mono text-[0.55rem]">
                      ${gi + 1}: {g ?? "—"}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
