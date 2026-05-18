"use client";

import {
  useActionState,
  useId,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
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

type AuthMode = "signin" | "signup" | "code";

export function AuthForm({ next }: AuthFormProps) {
  const t = useTranslations("Auth");
  const emailId = useId();
  const passwordId = useId();
  const tokenId = useId();

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

  const [mode, setMode] = useState<AuthMode>("signin");
  const [returnToForm, setReturnToForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const pending =
    magicPending || otpPending || signInPending || signUpPending;

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
            htmlFor={tokenId}
            className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t("otpLabel")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={tokenId}
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
              aria-busy={otpPending || undefined}
              aria-label={t("verifyOtp")}
              className="h-11 shrink-0 gap-2 sm:h-10"
            >
              {otpPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="size-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{t("verifyOtp")}</span>
            </Button>
          </div>
          {otpState.status === "error" ? (
            <ErrorLine text={t(`magicLinkError.${otpState.messageKey}`)} />
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

  const errorMessage =
    mode === "signin" && signInState.status === "error"
      ? t(`passwordError.${signInState.messageKey}`)
      : mode === "signup" && signUpState.status === "error"
        ? t(`signUpError.${signUpState.messageKey}`)
        : mode === "code" && magicState.status === "error"
          ? t(`magicLinkError.${magicState.messageKey}`)
          : null;

  const submitLabel =
    mode === "signup"
      ? t("createAccount")
      : mode === "code"
        ? t("sendMagicLink")
        : t("signInWithPassword");
  const SubmitIcon = mode === "signup" ? UserPlus : mode === "code" ? Mail : KeyRound;

  return (
    <div className="grid gap-3">
      <div
        role="tablist"
        aria-label={t("authModeLabel")}
        className="grid grid-cols-3 rounded-md border border-border bg-muted p-1"
      >
        <ModeButton
          active={mode === "signin"}
          onClick={() => {
            setMode("signin");
            setReturnToForm(false);
          }}
        >
          {t("signInTab")}
        </ModeButton>
        <ModeButton
          active={mode === "signup"}
          onClick={() => {
            setMode("signup");
            setReturnToForm(false);
          }}
        >
          {t("signUpTab")}
        </ModeButton>
        <ModeButton
          active={mode === "code"}
          onClick={() => {
            setMode("code");
            setReturnToForm(false);
          }}
        >
          {t("emailCodeTab")}
        </ModeButton>
      </div>

      <form
        action={
          mode === "signup"
            ? signUpAction
            : mode === "code"
              ? magicAction
              : signInAction
        }
        className="grid gap-3"
      >
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div className="grid gap-2">
          <label className="sr-only" htmlFor={emailId}>
            {t("emailLabel")}
          </label>
          <Input
            id={emailId}
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

          {mode !== "code" ? (
            <>
              <label className="sr-only" htmlFor={passwordId}>
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <Input
                  id={passwordId}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={8}
                  maxLength={72}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setPassword(event.target.value)
                  }
                  disabled={pending}
                  className="h-11 pr-10 sm:h-10"
                />
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
              </div>
              <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                {mode === "signup"
                  ? t("signUpHint")
                  : t("passwordHintFilled")}
              </p>
            </>
          ) : (
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
              {t("passwordHintEmpty")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={pending}
          aria-busy={
            (mode === "signup"
              ? signUpPending
              : mode === "code"
                ? magicPending
                : signInPending) || undefined
          }
          className="h-11 gap-2 sm:h-10"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <SubmitIcon className="size-4" aria-hidden="true" />
          )}
          <span>{submitLabel}</span>
        </Button>

        {mode === "signin" ? (
          <Button
            type="submit"
            formAction={magicAction}
            formNoValidate
            variant="link"
            size="sm"
            disabled={pending || email.trim().length === 0}
            className="-mt-1 h-auto justify-self-start p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            {t("forgotPassword")}
          </Button>
        ) : null}

        {errorMessage ? (
          <div className="grid gap-1">
            <ErrorLine text={errorMessage} />
            {shouldOfferEmailCode(mode, signInState, signUpState) ? (
              <Button
                type="submit"
                formAction={magicAction}
                formNoValidate
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
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-sm px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function shouldOfferEmailCode(
  mode: AuthMode,
  signInState: { status: string; messageKey?: string },
  signUpState: { status: string; messageKey?: string },
): boolean {
  if (
    mode === "signin" &&
    signInState.status === "error" &&
    (signInState.messageKey === "invalidCredentials" ||
      signInState.messageKey === "unconfirmedEmail")
  ) {
    return true;
  }
  if (
    mode === "signup" &&
    signUpState.status === "error" &&
    signUpState.messageKey === "userAlreadyExists"
  ) {
    return true;
  }
  return false;
}

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
