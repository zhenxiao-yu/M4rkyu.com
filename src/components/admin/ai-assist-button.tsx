"use client";

import { useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn, FOCUS_RING } from "@/lib/utils";

type AssistTask = "seoTitle" | "seoDescription" | "shortPitch" | "tags";

/**
 * Small ✨ affordance that drafts one field from sibling fields. It reads the
 * uncontrolled form's current values by `name` (no React state lifting needed),
 * posts them to the admin-only /api/admin/assist route, and writes the result
 * back into the `target` field — dispatching an `input` event so anything
 * listening (e.g. the live slug preview) reacts.
 */
export function AiAssistButton({
  task,
  target,
  sources,
}: {
  task: AssistTask;
  /** `name` of the field to fill. */
  target: string;
  /** `name`s of the fields to send as grounding context. */
  sources: string[];
}) {
  const t = useTranslations("Admin.assist");
  const ref = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);

  function fieldByName(form: HTMLFormElement, name: string) {
    const el = form.elements.namedItem(name);
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      return el;
    }
    return null;
  }

  async function run() {
    const form = ref.current?.form;
    if (!form || busy) return;

    const context: Record<string, string> = {};
    for (const name of sources) {
      const value = fieldByName(form, name)?.value?.trim();
      if (value) context[name] = value;
    }
    if (Object.keys(context).length === 0) {
      toast.error(t("empty"));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/assist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task, context }),
      });
      if (!res.ok) {
        const reason =
          res.status === 422
            ? "empty"
            : res.status === 429
              ? "rateLimited"
              : "error";
        toast.error(t(reason));
        return;
      }
      const data = (await res.json()) as { text?: string };
      const targetEl = fieldByName(form, target);
      if (data.text && targetEl) {
        targetEl.value = data.text;
        targetEl.dispatchEvent(new Event("input", { bubbles: true }));
        toast.success(t("success"));
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={run}
      disabled={busy}
      aria-label={t("generate")}
      title={t("generate")}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-ring/10 hover:text-ring disabled:cursor-not-allowed disabled:opacity-50",
        FOCUS_RING,
      )}
    >
      {busy ? (
        <Loader2 aria-hidden="true" className="size-3 animate-spin" />
      ) : (
        <Sparkles aria-hidden="true" className="size-3" />
      )}
      {t("generate")}
    </button>
  );
}
