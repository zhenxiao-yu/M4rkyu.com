"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "./submit-button";
import {
  ADMIN_ACTION_IDLE,
  type AdminActionState,
} from "@/lib/admin/action-state";

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

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.status === "success") {
      toast.success(state.message ?? successMessage);
    } else if (state.status === "error") {
      toast.error(state.message ?? "Something went wrong.");
    }
  }, [state, successMessage]);

  return (
    <form action={formAction} className="grid gap-8">
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

      {children}

      <div className="flex justify-end gap-2 border-t border-border/60 pt-6">
        <Button asChild variant="ghost" size="sm">
          <a href={cancelHref}>{cancelLabel}</a>
        </Button>
        <SubmitButton size="sm">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
