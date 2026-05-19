"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import {
  updateProfileAction,
  type ProfileFormState,
} from "./_actions";

interface ProfileFormProps {
  initial: {
    display_name: string;
    username: string;
    bio: string;
    website: string;
    public_profile: boolean;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const t = useTranslations("Account");
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    { status: "idle" },
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field
        id="display_name"
        label={t("fields.displayName")}
        hint={t("fieldsHint.displayName")}
      >
        <Input
          id="display_name"
          name="display_name"
          maxLength={60}
          defaultValue={initial.display_name}
          autoComplete="name"
        />
      </Field>

      <Field
        id="username"
        label={t("fields.username")}
        hint={t("fieldsHint.username")}
      >
        <Input
          id="username"
          name="username"
          maxLength={24}
          defaultValue={initial.username}
          autoComplete="username"
          pattern="[a-z0-9_-]{3,24}"
        />
      </Field>

      <Field id="bio" label={t("fields.bio")} hint={t("fieldsHint.bio")}>
        <textarea
          id="bio"
          name="bio"
          maxLength={280}
          rows={3}
          defaultValue={initial.bio}
          className={cn(
            "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm",
            FOCUS_RING_INSET,
          )}
        />
      </Field>

      <Field id="website" label={t("fields.website")}>
        <Input
          id="website"
          name="website"
          type="url"
          inputMode="url"
          defaultValue={initial.website}
          placeholder="https://"
          autoComplete="url"
        />
      </Field>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">{t("fields.visibility")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="public_profile"
            value="true"
            defaultChecked={initial.public_profile}
          />
          {t("fields.visibilityPublic")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="public_profile"
            value="false"
            defaultChecked={!initial.public_profile}
          />
          {t("fields.visibilityPrivate")}
        </label>
      </fieldset>

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

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-[0.7rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
