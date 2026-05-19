"use client";

import { useMemo, useState } from "react";
import { Copy, Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function BorderRadius() {
  const [tl, setTl] = useState(24);
  const [tr, setTr] = useState(24);
  const [br, setBr] = useState(24);
  const [bl, setBl] = useState(24);
  const [linked, setLinked] = useState(true);

  function setAll(value: number) {
    setTl(value);
    setTr(value);
    setBr(value);
    setBl(value);
  }

  const css = useMemo(() => {
    if (tl === tr && tr === br && br === bl) return `border-radius: ${tl}px;`;
    return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
  }, [tl, tr, br, bl]);

  const tw = useMemo(() => {
    if (tl === tr && tr === br && br === bl) {
      return `rounded-[${tl}px]`;
    }
    return `rounded-tl-[${tl}px] rounded-tr-[${tr}px] rounded-br-[${br}px] rounded-bl-[${bl}px]`;
  }, [tl, tr, br, bl]);

  const style: React.CSSProperties = {
    borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
  };

  function copy(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => toast.success(`Copied ${label}`));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
      <div className="grid place-items-center rounded-md border border-border bg-background/40 p-10">
        <div
          className="size-48 border-2 border-ring bg-ring/15 transition-[border-radius]"
          style={style}
        />
      </div>
      <div className="grid gap-3">
        <Button
          type="button"
          size="sm"
          variant={linked ? "default" : "outline"}
          onClick={() => setLinked((v) => !v)}
        >
          {linked ? (
            <Link2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Link2Off className="size-3.5" aria-hidden="true" />
          )}
          {linked ? "Linked" : "Per corner"}
        </Button>
        {linked ? (
          <CornerRow label="All corners" value={tl} onChange={setAll} />
        ) : (
          <>
            <CornerRow label="Top left" value={tl} onChange={setTl} />
            <CornerRow label="Top right" value={tr} onChange={setTr} />
            <CornerRow label="Bottom right" value={br} onChange={setBr} />
            <CornerRow label="Bottom left" value={bl} onChange={setBl} />
          </>
        )}
        <CopyField label="CSS" value={css} onCopy={() => copy(css, "CSS")} />
        <CopyField label="Tailwind" value={tw} onCopy={() => copy(tw, "class")} />
      </div>
    </div>
  );
}

function CornerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}px</span>
      </div>
      <input
        type="range"
        min={0}
        max={96}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-ring"
      />
    </div>
  );
}

function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="grid gap-1.5">
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs">{value}</code>
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          <Copy className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
