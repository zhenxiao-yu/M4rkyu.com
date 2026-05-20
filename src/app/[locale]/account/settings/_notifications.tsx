"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  updatePreferencesAction,
  type PreferencesFormState,
} from "./_actions";

interface NotificationPreferencesFormProps {
  initial: {
    email_notifications: boolean;
    browser_notifications: boolean;
  };
}

export function NotificationPreferencesForm({
  initial,
}: NotificationPreferencesFormProps) {
  const t = useTranslations("Account");
  const [state, formAction, pending] = useActionState<
    PreferencesFormState,
    FormData
  >(updatePreferencesAction, { status: "idle" });

  return (
    <form action={formAction} className="grid gap-4">
      <Toggle
        name="browser_notifications"
        label={t("notifications.browserTitle")}
        description={t("notifications.browserDescription")}
        defaultChecked={initial.browser_notifications}
      />
      <Toggle
        name="email_notifications"
        label={t("notifications.emailTitle")}
        description={t("notifications.emailDescription")}
        defaultChecked={initial.email_notifications}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        {state.status === "ok" ? (
          <p
            role="status"
            className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("saveSuccess")}
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-xs text-destructive">
            {t(`saveError.${state.messageKey}` as never)}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-border bg-background/50 p-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1"
      />
      <span className="grid gap-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}
