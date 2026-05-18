"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  requestMagicLinkAction,
  signInWithPasswordAction,
  signUpWithPasswordAction,
  verifyEmailOtpAction,
} from "@/lib/auth/actions";

interface AuthFormProps {
  /** Post-sign-in redirect destination (same-origin pathname). */
  next?: string;
}

/**
 * One form, three flows.
 *
 * The user always sees the same two fields: email, password (optional).
 *   - Leave password blank → primary button sends a magic link.
 *   - Fill password → primary button signs in with the password,
 *     and a secondary "Create account" appears for first-time visitors.
 *
 * That keeps the dialog single-column and removes a top-level
 * "sign in vs sign up" tab the user has to navigate before they've
 * typed anything. The submit buttons set distinct `formAction`s so
 * the server picks the right action without sniffing form data.
 *
 * Transitions:
 *   - magic-link send  → OTP-entry view (existing)
 *   - signup success   → "check your email" view
 *   - any sent view    → "Use a different email" button returns here
 */
export function AuthForm({ next }: AuthFormProps) {
  const t = useTranslations("Auth");

  const [magicState, magicAction, magicPending] = useActionState(
    requestMagicLinkAction,
    { status: "idle" as const },
  );
  const [otpState, otpAction, otpPending] = useActionState(
    verifyEmailOtpAction,
    { status: "idle" as const },
  );
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithPasswordAction,
    { status: "idle" as const },
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithPasswordAction,
    { status: "idle" as const },
  );

  const [returnToForm, setReturnToForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const pending =
    magicPending || otpPending || signInPending || signUpPending;
  const hasPassword = password.length > 0;

  // ── "Check your email" / OTP view after magic-link send ──
  if (magicState.status === "sent" && !returnToForm) {
    return (
      <div className="grid gap-3">
        <SentNotice
          title={t("magicLinkSentTitle")}
          body={t("magicLinkSentBody", { email: magicState.email })}
        />

        <form action={otpAction} className="grid gap-2">
          <input type="hidden" name="email" value={magicState.email} />
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
            <ErrorLine
              text={t(`magicLinkError.${otpState.messageKey}`)}
            />
          ) : null}
        </form>

        <SentFooter
          onReset={() => setReturnToForm(true)}
          resetLabel={t("useDifferentEmail")}
          hint={t("magicLinkSentFooter")}
        />
      </div>
    );
  }

  // ── "Check your email" view after signup ──
  if (signUpState.status === "confirmSent" && !returnToForm) {
    return (
      <div className="grid gap-3">
        <SentNotice
          title={t("confirmSentTitle")}
          body={t("confirmSentBody", { email: signUpState.email })}
        />
        <SentFooter
          onReset={() => setReturnToForm(true)}
          resetLabel={t("useDifferentEmail")}
          hint={t("magicLinkSentFooter")}
        />
      </div>
    );
  }

  // Surface whichever action errored most recently. The form clears
  // its own error on the next submit because useActionState resets
  // the state for the action that fired.
  const errorMessage =
    signInState.status === "error"
      ? t(`passwordError.${signInState.messageKey}`)
      : signUpState.status === "error"
        ? t(`signUpError.${signUpState.messageKey}`)
        : magicState.status === "error"
          ? t(`magicLinkError.${magicState.messageKey}`)
          : null;

  // The form action is the *primary* button's action. The secondary
  // button overrides via formAction. We default the form to magic
  // link, so even pressing Enter with an empty password sends a link.
  const formAction = hasPassword ? signInAction : magicAction;
  const primaryLabel = hasPassword
    ? t("signInWithPassword")
    : t("sendMagicLink");
  const PrimaryIcon = hasPassword ? KeyRound : Mail;

  return (
    <form action={formAction} className="grid gap-3">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="grid gap-2">
        <label className="sr-only" htmlFor="auth-email">
          {t("emailLabel")}
        </label>
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
          value={email}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setEmail(event.target.value)
          }
          disabled={pending}
          className="h-11 sm:h-10"
        />

        <label className="sr-only" htmlFor="auth-password">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Input
            id="auth-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={hasPassword ? "current-password" : "new-password"}
            minLength={8}
            maxLength={72}
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setPassword(event.target.value)
            }
            disabled={pending}
            className={cn("h-11 sm:h-10", hasPassword && "pr-10")}
          />
          {hasPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? t("hidePassword") : t("showPassword")
              }
              className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            {hasPassword ? t("passwordHintFilled") : t("passwordHintEmpty")}
          </p>
          {hasPassword ? (
            // Forgot-password recovery uses the same magic-link action
            // (rather than a dedicated reset email) — once the user
            // signs in via the link they can set a new password from
            // /account/settings. One auth surface, one less email
            // template to maintain.
            <Button
              type="submit"
              formAction={magicAction}
              variant="link"
              size="sm"
              className="h-auto whitespace-nowrap p-0 text-[0.7rem] text-muted-foreground hover:text-foreground"
            >
              {t("forgotPassword")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          type="submit"
          disabled={pending}
          aria-busy={
            (hasPassword ? signInPending : magicPending) || undefined
          }
          className="h-11 gap-2 sm:h-10"
        >
          <PrimaryIcon className="size-4" aria-hidden="true" />
          <span>{primaryLabel}</span>
        </Button>
        {hasPassword ? (
          <Button
            type="submit"
            // `formAction` overrides the parent form's action so this
            // submit hits signUpWithPasswordAction instead of sign-in.
            formAction={signUpAction}
            variant="outline"
            disabled={pending}
            aria-busy={signUpPending || undefined}
            className="h-11 gap-2 sm:h-10"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            <span>{t("createAccount")}</span>
          </Button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className="grid gap-1">
          <ErrorLine text={errorMessage} />
          {shouldOfferRecoveryLink(signInState, signUpState) ? (
            // Pivot users out of dead-end errors: a wrong password or
            // "email already exists" landing flips one click into a
            // working sign-in via email link. The button reuses the
            // form's email field and re-submits via the magic-link
            // action.
            <Button
              type="submit"
              formAction={magicAction}
              variant="link"
              size="sm"
              className="-ml-2 self-start gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {t("emailLinkInstead")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

function shouldOfferRecoveryLink(
  signInState: { status: string; messageKey?: string },
  signUpState: { status: string; messageKey?: string },
): boolean {
  if (
    signInState.status === "error" &&
    (signInState.messageKey === "invalidCredentials" ||
      signInState.messageKey === "unconfirmedEmail")
  ) {
    return true;
  }
  if (
    signUpState.status === "error" &&
    signUpState.messageKey === "userAlreadyExists"
  ) {
    return true;
  }
  return false;
}

// ── Small presentational helpers ────────────────────────────────

function SentNotice({ title, body }: { title: string; body: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-border bg-muted/40 p-3 text-sm"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-muted-foreground">{body}</p>
    </div>
  );
}

function SentFooter({
  onReset,
  resetLabel,
  hint,
}: {
  onReset: () => void;
  resetLabel: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="-ml-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {resetLabel}
      </Button>
      <p className="text-[0.7rem] text-muted-foreground">{hint}</p>
    </div>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="mt-1 flex items-start gap-1.5 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
