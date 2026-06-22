"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CircleAlert, ShieldOff } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { decodeJwt, type JwtErrorCode } from "@/lib/tools/jwt";

// Display-only JWT decoder. Header + payload are base64url-decoded and
// pretty-printed; the signature is shown but NEVER verified. Decoding lives in
// @/lib/tools/jwt (pure, never-throws, unit-tested).

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYXJrIiwibmFtZSI6Ik00cmt5dSIsImlhdCI6MTcxNzAwMDAwMCwiZXhwIjoxNzE3MDAzNjAwfQ.7n1mYf0eFqZ7n_Q1l7lP7eF7r2k5xV7v9j2k4HxN0Lw";

const ERROR_KEY: Record<JwtErrorCode, string> = {
  structure: "errorStructure",
  base64: "errorBase64",
  json: "errorJson",
};

// Read a client-only "now" without an effect+setState (React 19 lint forbids
// that). The server snapshot is `null`, so the expired/active badge stays
// hidden until hydration — no mismatch, no flash of the wrong state.
const subscribe = () => () => {};
function useClientNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => Date.now(),
    () => null,
  );
}

export function JwtDecoder() {
  const t = useTranslations("Tools.jwtDecoder");
  const tc = useTranslations("Tools.common");
  const [input, setInput] = useState(SAMPLE);
  const now = useClientNow();

  const decoded = useMemo(() => decodeJwt(input), [input]);

  const hasInput = input.trim().length > 0;

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label
          htmlFor="jwt-input"
          className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {tc("input")}
        </label>
        <div className="flex flex-wrap items-start gap-2">
          <textarea
            id="jwt-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={4}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={t("placeholder")}
            className={cn(
              "min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs break-all",
              FOCUS_RING_INSET,
            )}
          />
          <div className="flex shrink-0 gap-2">
            <CopyButton value={input} label={t("token")} disabled={!hasInput} />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setInput("")}
              disabled={!hasInput}
              className="min-h-9"
            >
              {tc("clear")}
            </Button>
          </div>
        </div>
      </div>

      {!hasInput ? (
        <div className="rounded-md border border-dashed border-border bg-card/30 px-4 py-6 text-center">
          <p className="text-sm font-medium text-foreground">{tc("empty")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tc("emptyHint")}</p>
        </div>
      ) : !decoded.ok ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 wrap-break-word">{t(ERROR_KEY[decoded.code])}</span>
        </p>
      ) : (
        <>
          <ClaimSummary
            issuedAt={decoded.issuedAt}
            expiresAt={decoded.expiresAt}
            now={now}
          />
          <Pane label={t("header")} value={decoded.header} />
          <Pane label={t("payload")} value={decoded.payload} />
          <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
            <ShieldOff className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0">{t("signatureNotice")}</span>
          </p>
        </>
      )}
    </div>
  );
}

function ClaimSummary({
  issuedAt,
  expiresAt,
  now,
}: {
  issuedAt: Date | null;
  expiresAt: Date | null;
  now: number | null;
}) {
  const t = useTranslations("Tools.jwtDecoder");
  const format = useFormatter();
  if (!issuedAt && !expiresAt) return null;

  // `now === null` until mount — hold the status badge back to avoid a
  // hydration mismatch and a flash of the wrong state.
  const expired =
    expiresAt && now !== null ? expiresAt.getTime() < now : null;

  const fmt = (date: Date) =>
    format.dateTime(date, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {expiresAt && expired !== null ? (
        <Badge variant={expired ? "warning" : "success"}>
          {expired ? t("expired") : t("active")}
        </Badge>
      ) : null}
      {issuedAt ? (
        <Badge variant="outline" className="gap-1 normal-case tracking-normal">
          <span className="font-semibold">{t("issued")}</span>
          <time dateTime={issuedAt.toISOString()}>{fmt(issuedAt)}</time>
        </Badge>
      ) : null}
      {expiresAt ? (
        <Badge variant="outline" className="gap-1 normal-case tracking-normal">
          <span className="font-semibold">{t("expires")}</span>
          <time dateTime={expiresAt.toISOString()}>{fmt(expiresAt)}</time>
        </Badge>
      ) : null}
    </div>
  );
}

function Pane({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <CopyButton value={value} label={label} />
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-card/40 px-3 py-2 font-mono text-xs leading-5 whitespace-pre-wrap break-all">
        {value}
      </pre>
    </div>
  );
}
