"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: "utm_source", label: "Source", required: true },
  { key: "utm_medium", label: "Medium", required: true },
  { key: "utm_campaign", label: "Campaign", required: true },
  { key: "utm_term", label: "Term (paid kw)" },
  { key: "utm_content", label: "Content (variant)" },
  { key: "utm_id", label: "Campaign ID" },
];

export function UtmBuilder() {
  const [base, setBase] = useState("https://m4rkyu.com/work");
  const [values, setValues] = useState<Record<string, string>>({});

  const url = useMemo(() => {
    try {
      const u = new URL(base);
      for (const { key } of FIELDS) {
        const v = values[key]?.trim();
        if (v) u.searchParams.set(key, v);
      }
      return u.toString();
    } catch {
      return "";
    }
  }, [base, values]);

  function copy() {
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => toast.success("Copied URL"));
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Base URL
        </span>
        <Input value={base} onChange={(e) => setBase(e.target.value)} className="font-mono" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(({ key, label, required }) => (
          <label key={key} className="grid gap-1.5 text-sm">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {label}
              {required ? " *" : ""}
            </span>
            <Input
              value={values[key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
              className="font-mono"
              spellCheck={false}
            />
          </label>
        ))}
      </div>
      <div className="grid gap-1.5">
        <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Tagged URL
        </label>
        <div className="flex items-start gap-2">
          <code className="flex-1 break-all rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">
            {url || "Enter a valid base URL"}
          </code>
          <Button type="button" size="sm" variant="outline" onClick={copy} disabled={!url}>
            <Copy className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
