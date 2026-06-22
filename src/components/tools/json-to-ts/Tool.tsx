"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "@/components/tools/_shared/copy-button";
import {
  isValidIdentifier,
  jsonToTs,
  sanitizeInterfaceName,
} from "@/lib/tools/json-to-ts";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const SAMPLE = `{"id": 1, "title": "Hello", "tags": ["x", "y"], "meta": {"draft": true}}`;

// Debounce window for the JSON textarea. Parsing + inference is keyed on the
// debounced value so a 10KB blob isn't re-parsed on every keystroke.
const DEBOUNCE_MS = 180;

export function JsonToTs() {
  const t = useTranslations("Tools.jsonToTs");
  const tc = useTranslations("Tools.common");

  const [name, setName] = useState("Root");
  const [input, setInput] = useState(SAMPLE);
  const [debouncedInput, setDebouncedInput] = useState(SAMPLE);

  // Debounce the JSON input; the name field updates `debouncedInput` instantly
  // through the separate memo below, so typing a name never waits on this.
  useEffect(() => {
    if (input === debouncedInput) return;
    const id = setTimeout(() => setDebouncedInput(input), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [input, debouncedInput]);

  // Stage 1 — parse + infer, keyed ONLY on the (debounced) JSON. This is the
  // expensive step and must not re-run when the interface name changes.
  const parsed = useMemo(() => {
    if (!debouncedInput.trim()) return { state: "empty" as const };
    // Parse once with a throwaway name; we re-render the name cheaply below.
    const result = jsonToTs(debouncedInput, "Root");
    if (!result.ok) {
      return result.error === "empty"
        ? { state: "empty" as const }
        : { state: "error" as const };
    }
    return { state: "ok" as const };
  }, [debouncedInput]);

  // Stage 2 — naming. Re-runs on every keystroke in the name field, but only
  // re-parses the JSON it already validated. Cheap relative to inference, and
  // the parse result is structurally cached by `debouncedInput` identity above.
  const output = useMemo(() => {
    if (parsed.state !== "ok") return "";
    const result = jsonToTs(debouncedInput, name);
    return result.ok ? result.output : "";
  }, [parsed.state, debouncedInput, name]);

  const nameInvalid = name.trim().length > 0 && !isValidIdentifier(name);
  const sanitized = sanitizeInterfaceName(name);

  const status =
    parsed.state === "ok"
      ? tc("valid")
      : parsed.state === "empty"
        ? tc("empty")
        : tc("invalid");

  const outputBody =
    parsed.state === "ok"
      ? output
      : parsed.state === "empty"
        ? ""
        : t("syntaxError");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground sm:flex-none">
          <span className="shrink-0 font-mono uppercase tracking-[0.18em]">
            {t("interfaceLabel")}
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            spellCheck={false}
            aria-label={t("interfaceAria")}
            placeholder={t("interfacePlaceholder")}
            className={cn(
              "min-h-9 w-full min-w-0 rounded-md border border-border bg-background px-3 py-1 font-mono text-sm text-foreground sm:w-44",
              FOCUS_RING_INSET,
            )}
          />
        </label>

        <button
          type="button"
          onClick={() => setInput("")}
          disabled={input === ""}
          className={cn(
            "min-h-9 rounded-md border border-border bg-card/40 px-3 py-1 font-mono text-xs text-muted-foreground",
            "motion-safe:transition-colors motion-safe:duration-(--motion-fast) motion-safe:ease-(--ease-premium)",
            "hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
            FOCUS_RING_INSET,
          )}
        >
          {tc("clear")}
        </button>

        <CopyButton
          value={output}
          label="TypeScript"
          disabled={parsed.state !== "ok" || output === ""}
          className="ml-auto"
        >
          {tc("copy")}
        </CopyButton>

        <span
          className={cn(
            "w-full font-mono text-xs sm:ml-0 sm:w-auto",
            parsed.state === "error"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {status}
        </span>
      </div>

      {nameInvalid ? (
        <p className="font-mono text-xs text-muted-foreground" aria-live="polite">
          {t("nameHint", { name: sanitized })}
        </p>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          spellCheck={false}
          aria-label={tc("input")}
          placeholder={t("inputPlaceholder")}
          className={cn(
            "w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-xs",
            FOCUS_RING_INSET,
          )}
        />

        {parsed.state === "empty" ? (
          <div
            className="grid place-content-center gap-1 rounded-md border border-dashed border-border bg-card/30 px-3 py-6 text-center"
            aria-live="polite"
          >
            <p className="text-sm font-medium text-foreground">{tc("empty")}</p>
            <p className="text-xs text-muted-foreground">{tc("emptyHint")}</p>
          </div>
        ) : (
          <pre
            aria-label={tc("output")}
            aria-live="polite"
            className={cn(
              "w-full overflow-x-auto whitespace-pre rounded-md border bg-card/40 px-3 py-2 font-mono text-xs leading-5",
              parsed.state === "error"
                ? "border-destructive/40 text-destructive"
                : "border-border",
            )}
          >
            {outputBody}
          </pre>
        )}
      </div>
    </div>
  );
}
