"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function toFields(date: Date) {
  if (Number.isNaN(date.getTime())) return null;
  const seconds = Math.floor(date.getTime() / 1000);
  return {
    seconds,
    millis: date.getTime(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
    relative: relative(date),
  };
}

function relative(date: Date) {
  const delta = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(delta);
  const units: [number, string][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [2592000, "day"],
    [31536000, "month"],
    [Infinity, "year"],
  ];
  const divisors = [1, 60, 3600, 86400, 2592000, 31536000];
  for (let i = 0; i < units.length; i++) {
    if (abs < units[i][0]) {
      const value = Math.round(delta / divisors[i]);
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        value,
        units[i][1] as Intl.RelativeTimeFormatUnit,
      );
    }
  }
  return "—";
}

export function TimestampConverter() {
  const [unix, setUnix] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [iso, setIso] = useState(() => new Date().toISOString().slice(0, 19));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const fromUnix = toFields(new Date(Number(unix) * 1000));
  const fromIso = toFields(new Date(iso));

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value).then(() => toast.success(`Copied ${label}`));
  }
  function useNow() {
    const stamp = Math.floor(now / 1000);
    setUnix(stamp.toString());
    setIso(new Date(stamp * 1000).toISOString().slice(0, 19));
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/40 px-3 py-2 text-sm">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          Now
        </span>
        <code className="font-mono">{Math.floor(now / 1000)}</code>
        <Button type="button" size="sm" variant="outline" onClick={useNow} className="ml-auto">
          Use now
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Pane title="Unix → date">
          <label className="grid gap-1.5 text-sm">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              Unix seconds
            </span>
            <Input
              value={unix}
              onChange={(e) => setUnix(e.target.value.trim())}
              className="font-mono"
              inputMode="numeric"
            />
          </label>
          <Read fields={fromUnix} onCopy={copy} />
        </Pane>
        <Pane title="Date → unix">
          <label className="grid gap-1.5 text-sm">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              ISO / date string
            </span>
            <Input value={iso} onChange={(e) => setIso(e.target.value)} className="font-mono" />
          </label>
          <Read fields={fromIso} onCopy={copy} />
        </Pane>
      </div>
    </div>
  );
}

function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-md border border-border bg-card/40 p-4">
      <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Read({
  fields,
  onCopy,
}: {
  fields: ReturnType<typeof toFields>;
  onCopy: (v: string, l: string) => void;
}) {
  if (!fields)
    return (
      <p className="text-xs text-destructive">Invalid input.</p>
    );
  const rows: [string, string][] = [
    ["UTC", fields.utc],
    ["Local", fields.local],
    ["ISO", fields.iso],
    ["Millis", String(fields.millis)],
    ["Seconds", String(fields.seconds)],
    ["Relative", fields.relative],
  ];
  return (
    <ul className="grid gap-1.5">
      {rows.map(([k, v]) => (
        <li key={k} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0 font-mono uppercase tracking-[0.16em] text-muted-foreground">{k}</span>
          <code className="flex-1 truncate font-mono">{v}</code>
          <Button type="button" size="sm" variant="outline" onClick={() => onCopy(v, k)}>
            <Copy className="size-3" aria-hidden="true" />
          </Button>
        </li>
      ))}
    </ul>
  );
}
