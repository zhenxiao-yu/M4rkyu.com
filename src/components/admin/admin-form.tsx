"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import { AdminFormErrorsContext } from "./form-errors";
import {
  ADMIN_ACTION_IDLE,
  type AdminActionState,
} from "@/lib/admin/action-state";

const NO_FIELD_ERRORS: Record<string, string> = {};
const DRAFT_PREFIX = "admin-draft:";

type AdminAction = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

interface DraftSnapshot {
  values: Record<string, string>;
  checks: Record<string, boolean>;
  at: number;
}

// Capture the serializable fields of a form. File + hidden inputs are skipped
// (files can't be persisted; hidden inputs carry ids / TagField state that a
// controlled component owns), as are unnamed fields.
function snapshotForm(form: HTMLFormElement): Omit<DraftSnapshot, "at"> {
  const values: Record<string, string> = {};
  const checks: Record<string, boolean> = {};
  form
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "input, textarea, select",
    )
    .forEach((el) => {
      if (!el.name) return;
      if (el instanceof HTMLInputElement) {
        if (el.type === "file" || el.type === "hidden" || el.type === "radio") {
          return;
        }
        if (el.type === "checkbox") {
          checks[el.name] = el.checked;
          return;
        }
      }
      values[el.name] = el.value;
    });
  return { values, checks };
}

// Client shell that wires any admin server action through useActionState so
// failures render an inline banner (and never the error boundary) and successes
// raise a toast. Field sections are passed as `children` from the server page,
// so the heavy form body stays server-rendered.
//
// When `draftKey` is set, field values autosave (debounced) to localStorage and
// a restore/discard banner offers recovery after an accidental nav or reload —
// the draft clears on a successful save.
export function AdminForm({
  action,
  children,
  submitLabel,
  cancelHref,
  cancelLabel,
  hiddenFields,
  successMessage,
  draftKey,
}: {
  action: AdminAction;
  children: ReactNode;
  submitLabel: string;
  cancelHref: string;
  cancelLabel: string;
  hiddenFields?: ReactNode;
  successMessage: string;
  /** Stable per-editor key (e.g. `games:my-slug`) that turns on autosave. */
  draftKey?: string;
}) {
  const t = useTranslations("Admin");
  const [state, formAction] = useActionState(action, ADMIN_ACTION_IDLE);
  const lastHandled = useRef<AdminActionState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<DraftSnapshot | null>(null);

  const storageKey = draftKey ? DRAFT_PREFIX + draftKey : null;

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.status === "success") {
      toast.success(state.message ?? successMessage);
    } else if (state.status === "error") {
      toast.error(state.message ?? "Something went wrong.");
      // Move the user to the first field the server flagged — on a long
      // editor the offending input is often far off-screen. rAF lets the
      // inputs render their aria-invalid first.
      if (state.fieldErrors) {
        requestAnimationFrame(() => {
          const el = formRef.current?.querySelector<HTMLElement>(
            '[aria-invalid="true"]',
          );
          el?.focus({ preventScroll: true });
          el?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
      }
    }
  }, [state, successMessage]);

  // ⌘/Ctrl+S submits — long editors shouldn't force a scroll-to-the-button.
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // Surface any draft saved on a previous visit.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      // Bridge an external store (localStorage) into UI state on mount — the
      // documented exception to set-state-in-effect (an SSR-safe lazy init
      // would mismatch hydration).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setDraft(JSON.parse(raw) as DraftSnapshot);
    } catch {
      /* corrupt entry — ignore */
    }
  }, [storageKey]);

  // Debounced autosave on every edit.
  useEffect(() => {
    const form = formRef.current;
    if (!storageKey || !form) return;
    let timer: ReturnType<typeof setTimeout>;
    const onEdit = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ ...snapshotForm(form), at: Date.now() }),
          );
        } catch {
          /* quota / private mode — best effort */
        }
      }, 600);
    };
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    return () => {
      clearTimeout(timer);
      form.removeEventListener("input", onEdit);
      form.removeEventListener("change", onEdit);
    };
  }, [storageKey]);

  // A successful save is the source of truth — drop the local draft.
  useEffect(() => {
    if (state.status === "success" && storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      // Reacting to the async action result (external state) — same documented
      // set-state-in-effect exception as the load above.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(null);
    }
  }, [state.status, storageKey]);

  function restoreDraft() {
    const form = formRef.current;
    if (!form || !draft) return;
    for (const [name, value] of Object.entries(draft.values)) {
      const el = form.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(`[name="${CSS.escape(name)}"]`);
      if (!el || (el instanceof HTMLInputElement && el.type === "file")) continue;
      el.value = value;
      // Let any controlled inputs / dependent UI react to the restore.
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    for (const [name, checked] of Object.entries(draft.checks)) {
      const el = form.querySelector<HTMLInputElement>(
        `input[type="checkbox"][name="${CSS.escape(name)}"]`,
      );
      if (el) el.checked = checked;
    }
    setDraft(null);
  }

  function discardDraft() {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
    }
    setDraft(null);
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      // No encType/method here: with a function action React sets the
      // encoding itself (and serializes File inputs to the server action),
      // so specifying it both warns and gets overridden.
      className="grid gap-8"
    >
      {hiddenFields}

      {draft ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ring/40 bg-ring/5 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-foreground">
            <History aria-hidden="true" className="size-4 shrink-0 text-ring" />
            {t("draftFound")}
          </span>
          <span className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={restoreDraft}>
              {t("draftRestore")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={discardDraft}>
              {t("draftDiscard")}
            </Button>
          </span>
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{state.message ?? "Something went wrong. Try again."}</span>
        </div>
      ) : null}

      <AdminFormErrorsContext.Provider
        value={state.status === "error" ? (state.fieldErrors ?? NO_FIELD_ERRORS) : NO_FIELD_ERRORS}
      >
        {children}
      </AdminFormErrorsContext.Provider>

      {/* Sticky action bar — on a long editor the Save button can sit far
        * below the fold. Pinning it to the bottom of the viewport keeps
        * Save / Cancel reachable on any screen without scrolling. */}
      <div className="sticky bottom-3 z-20 flex items-center justify-end gap-2 rounded-lg border border-border/60 bg-background/85 px-3 py-2.5 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/70">
        <Button asChild variant="ghost" size="sm">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
        <SubmitButton size="sm">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
