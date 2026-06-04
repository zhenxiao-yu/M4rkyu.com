"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, FOCUS_RING } from "@/lib/utils";

interface Captured {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: number;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  repeat: boolean;
}

const LOCATIONS = ["standard", "left", "right", "numpad"];

// Keys that scroll the page — swallow them while the pad is focused so
// the capture works without the page jumping. Tab is intentionally NOT
// included so keyboard users can always tab away (no focus trap).
const SWALLOW = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

export function Keycode() {
  const padRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<Captured | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    padRef.current?.focus();
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (SWALLOW.has(e.code)) e.preventDefault();
    setCap({
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      location: e.location,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      repeat: e.repeat,
    });
  }

  const snippet = cap
    ? `addEventListener("keydown", (e) => {\n  if (e.code === ${JSON.stringify(cap.code)}) {\n    // …\n  }\n});`
    : "";

  function copySnippet() {
    if (!snippet) return;
    void navigator.clipboard.writeText(snippet).then(() => toast.success("Copied snippet"));
  }

  const mods = cap
    ? (["ctrl", "alt", "shift", "meta"] as const).filter((m) => cap[m])
    : [];

  return (
    <div className="grid gap-4">
      <div
        ref={padRef}
        tabIndex={0}
        role="button"
        aria-label="Press any key to inspect it"
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "grid min-h-44 place-items-center gap-3 rounded-lg border border-dashed bg-card/40 p-6 text-center transition-colors duration-(--motion-fast)",
          focused ? "border-ring/60" : "border-border",
          FOCUS_RING,
        )}
      >
        {cap ? (
          <>
            <span className="font-display text-5xl font-black leading-none sm:text-6xl">
              {cap.code || "—"}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              event.key ={" "}
              <span className="text-foreground">{JSON.stringify(cap.key)}</span>
            </span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {mods.length > 0 ? (
                mods.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-ring/40 bg-ring/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ring"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
                  no modifiers
                </span>
              )}
            </div>
          </>
        ) : (
          <span className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {focused ? "press any key" : "click here, then press a key"}
          </span>
        )}
      </div>

      {cap ? (
        <>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="event.code" value={cap.code} mono />
            <Field label="event.key" value={cap.key} mono />
            <Field label="keyCode" value={String(cap.keyCode)} mono />
            <Field label="which" value={String(cap.which)} mono />
            <Field label="location" value={`${cap.location} · ${LOCATIONS[cap.location] ?? "?"}`} mono />
            <Field label="repeat" value={cap.repeat ? "true" : "false"} mono />
          </dl>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                Listener snippet
              </span>
              <Button type="button" size="sm" variant="outline" onClick={copySnippet}>
                <Copy className="size-3.5" aria-hidden="true" /> Copy
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-md border border-border bg-card/40 p-3 font-mono text-xs leading-relaxed">
              {snippet}
            </pre>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 rounded-md border border-border bg-card/40 px-3 py-2">
      <dt className="font-mono text-[0.55rem] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("truncate text-sm", mono && "font-mono")}>{value}</dd>
    </div>
  );
}
