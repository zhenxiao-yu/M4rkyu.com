"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  moderateCommentAction,
  deleteCommentAsAdminAction,
} from "@/lib/comments/moderation";
import type { CommentStatus } from "@/lib/supabase/types";

interface ModerationControlsProps {
  id: string;
  status: CommentStatus;
}

export function ModerationControls({ id, status }: ModerationControlsProps) {
  const t = useTranslations("Admin");
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ ok: true } | { ok: false; reason: string }>,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(t("moderationFailed"));
      } else {
        toast.success(t("moderationOk"));
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <Button
        type="button"
        size="sm"
        variant={status === "approved" ? "secondary" : "default"}
        disabled={pending || status === "approved"}
        onClick={() => run(() => moderateCommentAction({ id, status: "approved" }))}
      >
        {t("approve")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending || status === "rejected"}
        onClick={() => run(() => moderateCommentAction({ id, status: "rejected" }))}
      >
        {t("reject")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending || status === "hidden"}
        onClick={() => run(() => moderateCommentAction({ id, status: "hidden" }))}
      >
        {t("hide")}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => run(() => deleteCommentAsAdminAction(id))}
        className="ml-auto text-destructive hover:text-destructive"
      >
        {t("delete")}
      </Button>
    </div>
  );
}
