"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

interface Parsed {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
}

const PRESETS: { label: string; cron: string }[] = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Hourly", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Mon-Fri at 9am", cron: "0 9 * * 1-5" },
  { label: "First of month, 6am", cron: "0 6 1 * *" },
];

function parse(expr: string): Parsed | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return { minute: parts[0], hour: parts[1], dom: parts[2], month: parts[3], dow: parts[4] };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function describeField(value: string, unit: string, names?: string[]): string {
  if (value === "*") return `every ${unit}`;
  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `every ${step} ${unit}${step === "1" ? "" : "s"}`;
  }
  if (value.includes(",")) {
    const items = value.split(",").map((v) => (names ? names[Number(v)] ?? v : v));
    return `at ${unit}${items.length > 1 ? "s" : ""} ${items.join(", ")}`;
  }
  if (value.includes("-")) {
    const [a, b] = value.split("-");
    const an = names ? names[Number(a)] ?? a : a;
    const bn = names ? names[Number(b)] ?? b : b;
    return `from ${an} to ${bn}`;
  }
  return `at ${unit} ${names ? names[Number(value)] ?? value : value}`;
}

function describe(parsed: Parsed): string {
  const m = describeField(parsed.minute, "minute");
  const h = describeField(parsed.hour, "hour");
  const dom = parsed.dom === "*" ? null : describeField(parsed.dom, "day of month");
  const month = parsed.month === "*" ? null : describeField(parsed.month, "month", ["", ...MONTHS]);
  const dow = parsed.dow === "*" ? null : describeField(parsed.dow, "day of week", DAYS);
  return [m, h, dom, dow, month].filter(Boolean).join(", ");
}

export function CronExplainer() {
  const [input, setInput] = useState("0 9 * * 1-5");
  const parsed = useMemo(() => parse(input), [input]);
  const text = parsed ? describe(parsed) : null;

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Cron expression
        </span>
        <Input value={input} onChange={(e) => setInput(e.target.value)} className="font-mono" spellCheck={false} />
      </label>
      <div className="grid gap-1.5">
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          In English
        </label>
        <div className={`rounded-md border px-3 py-3 text-sm leading-6 ${parsed ? "border-border bg-card/40 text-foreground" : "border-destructive/40 bg-destructive/5 text-destructive"}`}>
          {parsed ? `Runs ${text}.` : "Invalid — 5 space-separated fields expected (min hr dom mon dow)."}
        </div>
      </div>
      {parsed ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(["minute", "hour", "dom", "month", "dow"] as const).map((k) => (
            <li key={k} className="grid gap-1 rounded-md border border-border bg-card/40 p-2">
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground">{k}</span>
              <code className="font-mono text-sm">{parsed[k]}</code>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-1.5">
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, cron }) => (
            <button
              key={cron}
              type="button"
              onClick={() => setInput(cron)}
              className="rounded-md border border-border bg-card/40 px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-ring/40 hover:text-foreground"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
