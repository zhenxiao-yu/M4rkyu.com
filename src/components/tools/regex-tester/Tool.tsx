"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { runRegex } from "@/lib/tools/regex";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;
type Flag = (typeof FLAGS)[number];

export function RegexTester() {
  const t = useTranslations("Tools.regexTester");
  const tc = useTranslations("Tools.common");
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState<Set<Flag>>(new Set(["g"]));
  const [text, setText] = useState(
    "Reach me at mark@m4rkyu.com or zyu347@uwo.ca.\nAlso valid: hello+spam@example.org",
  );

  const flagString = useMemo(
    () => FLAGS.filter((f) => flags.has(f)).join(""),
    [flags],
  );

  const result = useMemo(
    () => runRegex(pattern, flagString, text),
    [pattern, flagString, text],
  );

  function toggle(flag: Flag) {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(flag)) next.delete(flag);
      else next.add(flag);
      return next;
    });
  }

  // Highlight matches in the text — wraps each match in a <mark>.
  const highlighted = useMemo<ReactNode>(() => {
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

  const matchValues = result.ok
    ? result.matches.map((m) => m.value).join("\n")
    : "";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden="true" className="font-mono text-base text-muted-foreground">
          /
        </span>
        <Input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          aria-label={t("patternAria")}
          className="min-w-0 flex-1 font-mono"
        />
        <span aria-hidden="true" className="font-mono text-base text-muted-foreground">
          /
        </span>
        <div className="flex gap-1">
          {FLAGS.map((flag) => (
            <button
              key={flag}
              type="button"
              onClick={() => toggle(flag)}
              aria-pressed={flags.has(flag)}
              aria-label={t("flagAria", { flag })}
              className={cn(
                "grid size-7 place-items-center rounded-md border border-border font-mono text-xs",
                "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
                FOCUS_RING_INSET,
                flags.has(flag)
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {flag}
            </button>
          ))}
        </div>
        <Badge
          variant="outline"
          aria-live="polite"
          className={cn(
            "font-mono text-[0.6rem]",
            !result.ok && "border-destructive/40 text-destructive",
          )}
        >
          {result.ok ? t("matchCount", { count: result.matches.length }) : tc("invalid")}
        </Badge>
      </div>
      {!result.ok ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 font-mono text-xs break-words text-destructive"
        >
          {result.error}
        </p>
      ) : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        spellCheck={false}
        aria-label={t("testStringAria")}
        className={cn(
          "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs",
          FOCUS_RING_INSET,
        )}
      />
      <div className="overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs leading-6 break-words whitespace-pre-wrap">
        {highlighted}
      </div>
      {result.ok && result.matches.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {t("matchCount", { count: result.matches.length })}
            </span>
            <CopyButton value={matchValues} label={t("matchesLabel")} className="ml-auto" />
          </div>
          <ul className="grid gap-1.5">
            {result.matches.map((m, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-card/40 px-3 py-2 text-xs"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <code className="min-w-0 font-mono break-words">{m.value}</code>
                  <span className="shrink-0 font-mono text-[0.6rem] text-muted-foreground">
                    {t("atIndex", { index: m.index })}
                  </span>
                </div>
                {m.groups.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.groups.map((g, gi) => (
                      <Badge
                        key={gi}
                        variant="outline"
                        className="font-mono text-[0.55rem] break-words"
                      >
                        ${gi + 1}: {g ?? t("groupEmpty")}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
