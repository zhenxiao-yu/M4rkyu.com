"use client";

import { useActionState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SignInSheet } from "@/components/auth/sign-in-sheet";
import {
  submitCommentAction,
  type SubmitCommentState,
} from "@/lib/comments/actions";
import type { CommentItemType } from "@/lib/supabase/types";

interface CommentFormProps {
  itemType: CommentItemType;
  itemKey: string;
  signedIn: boolean;
  nextPath: string;
}

export function CommentForm({
  itemType,
  itemKey,
  signedIn,
  nextPath,
}: CommentFormProps) {
  const t = useTranslations("Comments");
  const [state, formAction, pending] = useActionState<SubmitCommentState, FormData>(
    submitCommentAction,
    { status: "idle" },
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (!signedIn) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm">
        <p className="text-muted-foreground">{t("signInPrompt")}</p>
        <div className="mt-3">
          <SignInSheet next={nextPath} />
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-2">
      <input type="hidden" name="itemType" value={itemType} />
      <input type="hidden" name="itemKey" value={itemKey} />
      <label className="sr-only" htmlFor="comment-body">
        {t("bodyLabel")}
      </label>
      <textarea
        id="comment-body"
        name="body"
        rows={3}
        minLength={2}
        maxLength={2000}
        placeholder={t("placeholder")}
        required
        disabled={pending}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.7rem] text-muted-foreground">{t("moderationNotice")}</p>
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </div>
      {state.status === "ok" ? (
        <p
          role="status"
          className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {state.pending ? t("submitOkPending") : t("submitOkApproved")}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {t(`submitError.${state.messageKey}` as never)}
        </p>
      ) : null}
    </form>
  );
}
