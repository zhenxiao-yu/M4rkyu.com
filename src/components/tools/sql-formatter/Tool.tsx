"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const KEYWORDS = [
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
  "on",
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
  "table",
  "if",
  "exists",
  "primary",
  "key",
  "foreign",
  "references",
  "default",
  "with",
  "returning",
  "union",
  "all",
  "distinct",
  "case",
  "when",
  "then",
  "else",
  "end",
];

const BREAK_BEFORE = new Set([
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
  "with",
  "join",
  "left",
  "right",
  "inner",
  "outer",
  "full",
]);

// Token-level formatter — uppercases keywords, breaks before major
// clauses, indents a level. Not a full parser; aims for "good enough
// to read" on hand-pasted queries.
function format(sql: string): string {
  const tokens = sql
    .replace(/\s+/g, " ")
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ")
    .replace(/,/g, " , ")
    .trim()
    .split(/\s+/);

  const out: string[] = [];
  let depth = 0;
  let firstClause = true;
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    if (!raw) continue;
    const lower = raw.toLowerCase();
    const isKeyword = KEYWORDS.includes(lower);
    const token = isKeyword ? lower.toUpperCase() : raw;

    if (raw === "(") {
      out.push(" (");
      depth++;
      continue;
    }
    if (raw === ")") {
      depth = Math.max(0, depth - 1);
      out.push(")");
      continue;
    }
    if (raw === ",") {
      out.push(",\n" + indent(depth + 1));
      continue;
    }

    if (BREAK_BEFORE.has(lower)) {
      if (!firstClause) out.push("\n" + indent(depth));
      out.push(token);
      firstClause = false;
      continue;
    }

    if (out.length === 0 || out[out.length - 1].endsWith("\n" + indent(depth)) || out[out.length - 1].endsWith("(")) {
      out.push(token);
    } else {
      out.push(" " + token);
    }
  }
  return out
    .join("")
    .replace(/\n\s*\n/g, "\n")
    .replace(/ +,/g, ",")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .trim() + ";";
}

function indent(level: number) {
  return "  ".repeat(level);
}

const SAMPLE = `select id, title, count(*) as posts from users u join posts p on p.user_id = u.id where u.active = true and p.published_at is not null group by u.id order by posts desc limit 10;`;

export function SqlFormatter() {
  const [input, setInput] = useState(SAMPLE);

  const output = useMemo(() => {
    try {
      return format(input.replace(/;\s*$/, ""));
    } catch {
      return input;
    }
  }, [input]);

  function copy() {
    void navigator.clipboard.writeText(output).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Token-level formatter — keyword uppercase + clause breaks
        </span>
        <Button type="button" size="sm" variant="outline" onClick={copy}>
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder="Paste SQL…"
        aria-label="SQL input"
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <pre className="overflow-auto rounded-md border border-border bg-card/40 px-3 py-3 font-mono text-xs leading-6">
{output}
      </pre>
    </div>
  );
}
