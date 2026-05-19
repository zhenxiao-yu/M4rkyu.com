"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TS =
  | { kind: "primitive"; name: string }
  | { kind: "array"; inner: TS }
  | { kind: "object"; fields: { name: string; type: TS; optional?: boolean }[] }
  | { kind: "union"; members: TS[] }
  | { kind: "null" }
  | { kind: "any" };

function infer(value: unknown): TS {
  if (value === null) return { kind: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", inner: { kind: "any" } };
    const inferred = value.map(infer);
    const merged = mergeAll(inferred);
    return { kind: "array", inner: merged };
  }
  if (typeof value === "object") {
    const fields = Object.entries(value as Record<string, unknown>).map(([name, v]) => ({
      name,
      type: infer(v),
      optional: false,
    }));
    return { kind: "object", fields };
  }
  if (typeof value === "string") return { kind: "primitive", name: "string" };
  if (typeof value === "number") return { kind: "primitive", name: "number" };
  if (typeof value === "boolean") return { kind: "primitive", name: "boolean" };
  return { kind: "any" };
}

function mergeAll(types: TS[]): TS {
  let acc = types[0];
  for (let i = 1; i < types.length; i++) acc = merge(acc, types[i]);
  return acc;
}

function merge(a: TS, b: TS): TS {
  if (a.kind === "any") return b;
  if (b.kind === "any") return a;
  if (a.kind === b.kind && a.kind === "primitive" && a.name === (b as typeof a).name) return a;
  if (a.kind === "array" && b.kind === "array") return { kind: "array", inner: merge(a.inner, b.inner) };
  if (a.kind === "object" && b.kind === "object") {
    const names = new Set([...a.fields.map((f) => f.name), ...b.fields.map((f) => f.name)]);
    const fields = Array.from(names).map((name) => {
      const fa = a.fields.find((f) => f.name === name);
      const fb = b.fields.find((f) => f.name === name);
      const type = fa && fb ? merge(fa.type, fb.type) : (fa?.type ?? fb!.type);
      const optional = !fa || !fb;
      return { name, type, optional };
    });
    return { kind: "object", fields };
  }
  return { kind: "union", members: [a, b] };
}

function render(ts: TS, indent = 0): string {
  const pad = "  ".repeat(indent);
  switch (ts.kind) {
    case "primitive":
      return ts.name;
    case "null":
      return "null";
    case "any":
      return "unknown";
    case "array":
      return `${render(ts.inner, indent)}[]`;
    case "union":
      return ts.members.map((m) => render(m, indent)).join(" | ");
    case "object": {
      if (ts.fields.length === 0) return "Record<string, unknown>";
      const lines = ts.fields.map((f) => `${pad}  ${safeName(f.name)}${f.optional ? "?" : ""}: ${render(f.type, indent + 1)};`);
      return `{\n${lines.join("\n")}\n${pad}}`;
    }
  }
}

function safeName(name: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

export function JsonToTs() {
  const [name, setName] = useState("Root");
  const [input, setInput] = useState('{"id": 1, "title": "Hello", "tags": ["x", "y"], "meta": {"draft": true}}');

  const ts = useMemo(() => {
    try {
      const value = JSON.parse(input);
      const inferred = infer(value);
      return { ok: true as const, code: `interface ${name || "Root"} ${render(inferred, 0)}` };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, [name, input]);

  function copy() {
    if (!ts.ok) return;
    void navigator.clipboard.writeText(ts.code).then(() => toast.success("Copied"));
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">Interface</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="w-40 font-mono" spellCheck={false} />
        </label>
        <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!ts.ok} className="ml-auto">
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
        <pre className={`w-full overflow-auto rounded-md border bg-card/40 px-3 py-2 font-mono text-xs leading-5 ${ts.ok ? "border-border" : "border-destructive/40 text-destructive"}`}>
{ts.ok ? ts.code : ts.error}
        </pre>
      </div>
    </div>
  );
}
