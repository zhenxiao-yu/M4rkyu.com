"use client";

import { useActionState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import { AdminFormErrorsContext } from "./form-errors";
import {
  ADMIN_ACTION_IDLE,
  type AdminActionState,
} from "@/lib/admin/action-state";

const NO_FIELD_ERRORS: Record<string, string> = {};

type AdminAction = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

// Client shell that wires any admin server action through useActionState
// so failures render an inline banner (and never the error boundary) and
// successes raise a toast. Field sections are passed as `children` from
// the server page, so the heavy form body stays server-rendered.
export function AdminForm({
  action,
  children,
  submitLabel,
  cancelHref,
  cancelLabel,
  hiddenFields,
  successMessage,
}: {
  action: AdminAction;
  children: ReactNode;
  submitLabel: string;
  cancelHref: string;
  cancelLabel: string;
  hiddenFields?: ReactNode;
  successMessage: string;
}) {
  const [state, formAction] = useActionState(action, ADMIN_ACTION_IDLE);
  const lastHandled = useRef<AdminActionState | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
