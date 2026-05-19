"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXJrIiwibmFtZSI6Ik00cmt5dSIsImlhdCI6MTcxNzAwMDAwMH0.7n1mYf0eFqZ7n_Q1l7lP7eF7r2k5xV7v9j2k4HxN0Lw";

function b64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return new TextDecoder().decode(
    Uint8Array.from(atob(padded + pad), (c) => c.charCodeAt(0)),
  );
}

export function JwtDecoder() {
  const [input, setInput] = useState(SAMPLE);

  const decoded = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed)
      return {
        ok: true as const,
        header: "",
        payload: "",
        issued: null,
        expiry: null,
      };
    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      return { ok: false as const, error: "JWT must have 3 dot-separated parts." };
    }
    try {
      const headerObj = JSON.parse(b64urlDecode(parts[0]));
      const claims = JSON.parse(b64urlDecode(parts[1])) as Record<string, unknown>;
      return {
        ok: true as const,
        header: JSON.stringify(headerObj, null, 2),
        payload: JSON.stringify(claims, null, 2),
        issued: readUnix(claims.iat),
        expiry: readUnix(claims.exp),
      };
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }
  }, [input]);

  const expiry = decoded.ok ? decoded.expiry : null;
  const issued = decoded.ok ? decoded.issued : null;

  return (
    <div className="grid gap-4">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="Paste a JWT"
        className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      {!decoded.ok ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {decoded.error}
        </p>
      ) : (
        <>
          {(expiry || issued) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {issued ? (
                <Badge variant="outline">issued · {issued.toLocaleString()}</Badge>
              ) : null}
              {expiry ? (
                <Badge variant="outline">exp · {expiry.toLocaleString()}</Badge>
              ) : null}
            </div>
          )}
          <Pane label="Header" value={decoded.header} />
          <Pane label="Payload" value={decoded.payload} />
          <p className="text-[0.65rem] text-muted-foreground/70">
            Signature is shown but never verified — bring a key + the right algorithm to do that server-side.
          </p>
        </>
      )}
    </div>
  );
}

function readUnix(value: unknown): Date | null {
  if (typeof value !== "number") return null;
  return new Date(value * 1000);
}

function Pane({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <pre className="overflow-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs leading-5">
        {value}
      </pre>
    </div>
  );
}
