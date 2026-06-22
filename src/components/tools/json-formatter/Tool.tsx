"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/_shared/copy-button";

const SAMPLE = `{"name":"M4rkyu","stack":["next","tailwind"],"meta":{"year":2026}}`;

export function JsonFormatter() {
  const t = useTranslations("Tools.jsonFormatter");
  const tc = useTranslations("Tools.common");
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo<
    | { ok: true; output: string; empty: boolean }
    | { ok: false; error: string }
  >(() => {
    if (!input.trim()) return { ok: true, output: "", empty: true };
    try {
      const parsed = JSON.parse(input);
      return { ok: true, output: JSON.stringify(parsed, null, indent), empty: false };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }, [input, indent]);

  function minify() {
    if (!result.ok || result.empty) return;
    try {
      setInput(JSON.stringify(JSON.parse(input)));
    } catch {
      /* surfaced via result */
    }
  }

  const status = result.ok
    ? result.empty
      ? tc("empty")
      : tc("valid")
    : tc("invalid");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">{t("indent")}</span>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            aria-label={t("indent")}
            className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs"
          >
            <option value={2}>{t("indentSpaces", { count: 2 })}</option>
            <option value={4}>{t("indentSpaces", { count: 4 })}</option>
            <option value={0}>{t("indentNone")}</option>
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={minify}
          disabled={!result.ok || result.empty}
        >
          {t("minify")}
        </Button>
        <CopyButton
          value={result.ok ? result.output : ""}
          label="JSON"
          disabled={!result.ok || result.empty}
        >
          {t("copyOutput")}
        </CopyButton>
        <span
          className={`ml-auto font-mono text-xs ${result.ok ? "text-muted-foreground" : "text-destructive"}`}
          aria-live="polite"
        >
          {status}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          rows={14}
          aria-label={t("inputAria")}
          placeholder={t("inputPlaceholder")}
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
        />
        <textarea
          readOnly
          value={result.ok ? result.output : result.error}
          rows={14}
          aria-label={t("outputAria")}
          aria-live="polite"
          placeholder={tc("emptyHint")}
          className={`w-full resize-y rounded-md border bg-card/40 px-3 py-2 font-mono text-xs ${result.ok ? "border-border" : "border-destructive/40 text-destructive"}`}
        />
      </div>
    </div>
  );
}
