"use client";

import { useActionState, useState } from "react";
import { AlertCircle, ArrowLeft, KeyRound, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  requestMagicLinkAction,
  verifyEmailOtpAction,
} from "@/lib/auth/actions";

interface MagicLinkFormProps {
  next?: string;
}

export function MagicLinkForm({ next }: MagicLinkFormProps) {
  const t = useTranslations("Auth");
  const [state, formAction, pending] = useActionState(requestMagicLinkAction, {
    status: "idle" as const,
  });
  const [otpState, otpAction, otpPending] = useActionState(
    verifyEmailOtpAction,
    {
      status: "idle" as const,
    },
  );

  /**
   * Local override so the user can step back from the "sent" state and
   * fix a typo without closing the whole dialog. `useActionState` keeps
   * the last result until a new submission, so we layer this on top.
   */
  const [returnToEmail, setReturnToEmail] = useState(false);
  const showSentView = state.status === "sent" && !returnToEmail;

  if (showSentView && state.status === "sent") {
    return (
      <div className="grid gap-3">
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-border bg-muted/40 p-3 text-sm"
        >
          <p className="font-medium">{t("magicLinkSentTitle")}</p>
          <p className="mt-1 text-muted-foreground">
            {t("magicLinkSentBody", { email: state.email })}
          </p>
        </div>

        <form action={otpAction} className="grid gap-2">
          <input type="hidden" name="email" value={state.email} />
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <label
            htmlFor="auth-token"
            className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("otpLabel")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="auth-token"
              name="token"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              pattern="[0-9]{6,8}"
              maxLength={8}
              disabled={otpPending}
              className="h-11 font-mono text-lg tracking-[0.3em] sm:h-10"
            />
            <Button
              type="submit"
              disabled={otpPending}
              aria-label={t("verifyOtp")}
              className="h-11 shrink-0 gap-2 sm:h-10"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("verifyOtp")}</span>
            </Button>
          </div>
          {otpState.status === "error" ? (
            <p
              role="alert"
              aria-live="polite"
              className="mt-1 flex items-start gap-1.5 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span>{t(`magicLinkError.${otpState.messageKey}`)}</span>
            </p>
          ) : null}
        </form>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReturnToEmail(true)}
            className="-ml-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t("useDifferentEmail")}
          </Button>
          <p className="text-[0.7rem] text-muted-foreground">
            {t("magicLinkSentFooter")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="sr-only" htmlFor="auth-email">
        {t("emailLabel")}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="auth-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t("emailPlaceholder")}
          disabled={pending}
          // Bumped touch target on mobile to clear the 44px iOS
          // minimum. Desktop falls back to the default h-10.
          className="h-11 sm:h-10"
        />
        <Button
          type="submit"
          variant="default"
          disabled={pending}
          aria-label={t("sendMagicLink")}
          aria-busy={pending || undefined}
          className="h-11 shrink-0 gap-2 sm:h-10"
        >
          <Mail className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("sendMagicLink")}</span>
        </Button>
      </div>
      {state.status === "error" ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-1 flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{t(`magicLinkError.${state.messageKey}`)}</span>
        </p>
      ) : null}
    </form>
  );
}
