"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Direction = "csv-to-json" | "json-to-csv";

// Minimal CSV parser — handles quoted cells with embedded commas,
// escaped quotes ("" → "), and CRLF/LF line endings. Sufficient for
// hand-pasted inputs.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.length > 0));
}

function csvToJson(text: string): { ok: true; output: string } | { ok: false; error: string } {
  const rows = parseCsv(text);
  if (rows.length === 0) return { ok: true, output: "[]" };
  const [header, ...body] = rows;
  const out = body.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => {
      obj[key] = row[i] ?? "";
    });
    return obj;
  });
  return { ok: true, output: JSON.stringify(out, null, 2) };
}

function jsonToCsv(text: string): { ok: true; output: string } | { ok: false; error: string } {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) return { ok: false, error: "Expected a JSON array of objects." };
    if (data.length === 0) return { ok: true, output: "" };
    const keys = Array.from(
      new Set(data.flatMap((row: unknown) => (row && typeof row === "object" ? Object.keys(row) : []))),
    );
    const escape = (v: unknown) => {
      const s = v === undefined || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [keys.join(",")];
    for (const row of data as Record<string, unknown>[]) {
      lines.push(keys.map((k) => escape(row?.[k])).join(","));
    }
    return { ok: true, output: lines.join("\n") };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function CsvJson() {
  const [direction, setDirection] = useState<Direction>("csv-to-json");
  const [input, setInput] = useState("name,role\nMark,engineer\nZhen,designer");

  const result = useMemo(() => (direction === "csv-to-json" ? csvToJson(input) : jsonToCsv(input)), [direction, input]);

  function copy() {
    if (!result.ok) return;
    void navigator.clipboard.writeText(result.output).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="inline-flex rounded-md border border-border bg-card/40 p-0.5">
          {(["csv-to-json", "json-to-csv"] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={direction === d}
              onClick={() => setDirection(d)}
              className={`rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.15em] ${direction === d ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {d === "csv-to-json" ? "CSV → JSON" : "JSON → CSV"}
            </button>
          ))}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!result.ok} className="ml-auto">
          <Copy className="size-3.5" aria-hidden="true" /> Copy
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
        />
        <textarea
          readOnly
          value={result.ok ? result.output : result.error}
          rows={14}
          className={`w-full rounded-md border bg-card/40 px-3 py-2 font-mono text-xs ${result.ok ? "border-border" : "border-destructive/40 text-destructive"}`}
        />
      </div>
    </div>
  );
}
