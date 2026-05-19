"use client";

import { useActionState, useState, useTransition } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { UserIdentity } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConnectedAccounts } from "@/components/auth/connected-accounts";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import {
  deleteAccountAction,
  signOutAction,
  updatePasswordAction,
} from "@/lib/auth/actions";

interface SecurityPanelProps {
  locale: string;
  email: string | null;
  identities: UserIdentity[];
}

// Security pane: password / connected accounts / global sign-out / danger zone. Each form owns its own useActionState so errors stay scoped.
export function SecurityPanel({ locale, email, identities }: SecurityPanelProps) {
  return (
    <div className="grid gap-6">
      <PasswordSection />
      <ConnectedAccounts identities={identities} />
      <GlobalSignOutSection locale={locale} />
      <DangerZone locale={locale} email={email} />
    </div>
  );
}

function PasswordSection() {
  const t = useTranslations("Account.security");
  const [state, formAction, pending] = useActionState(updatePasswordAction, {
    status: "idle" as const,
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section aria-labelledby="security-password" className="grid gap-3">
      <header className="grid gap-1">
        <h3
          id="security-password"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <KeyRound className="size-4" aria-hidden="true" />
          {t("passwordTitle")}
        </h3>
        <p className="text-[0.7rem] text-muted-foreground">
          {t("passwordDescription")}
        </p>
      </header>

      <form action={formAction} className="grid gap-2 sm:max-w-sm">
        <label htmlFor="new-password" className="sr-only">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <Input
            id="new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder={t("passwordPlaceholder")}
            disabled={pending}
            className="h-11 pr-10 sm:h-10"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            className={cn(
              "absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground",
              FOCUS_RING_INSET,
            )}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={pending} size="sm">
            {t("savePassword")}
          </Button>
          {state.status === "ok" ? (
            <p
              role="status"
              className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t("passwordSaved")}
            </p>
          ) : null}
          {state.status === "error" ? (
            <ErrorLine text={t(`passwordError.${state.messageKey}`)} />
          ) : null}
        </div>
      </form>
    </section>
  );
}

function GlobalSignOutSection({ locale }: { locale: string }) {
  const t = useTranslations("Account.security");
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-labelledby="security-sessions"
      className="grid gap-3 border-t border-border pt-6"
    >
      <header className="grid gap-1">
        <h3
          id="security-sessions"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t("sessionsTitle")}
        </h3>
        <p className="text-[0.7rem] text-muted-foreground">
          {t("sessionsDescription")}
        </p>
      </header>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await signOutAction(locale, "global");
            })
          }
        >
          {t("signOutEverywhere")}
        </Button>
      </div>
    </section>
  );
}

function DangerZone({
  locale,
  email,
}: {
  locale: string;
  email: string | null;
}) {
  const t = useTranslations("Account.security");
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, {
    status: "idle" as const,
  });

  return (
    <section
      aria-labelledby="security-danger"
      className="grid gap-3 border-t border-destructive/30 pt-6"
    >
      <header className="grid gap-1">
        <h3
          id="security-danger"
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            "text-destructive",
          )}
        >
          <ShieldAlert className="size-4" aria-hidden="true" />
          {t("dangerTitle")}
        </h3>
        <p className="text-[0.7rem] text-muted-foreground">
          {t("dangerDescription")}
        </p>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {t("deleteAccount")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("deleteDialogTitle")}</DialogTitle>
            <DialogDescription>
              {email
                ? t("deleteDialogBodyWithEmail", { email })
                : t("deleteDialogBodyNoEmail")}
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="grid gap-2">
            <input type="hidden" name="locale" value={locale} />
            <label
              htmlFor="delete-confirmation"
              className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t("deleteConfirmLabel")}
            </label>
            <Input
              id="delete-confirmation"
              name="confirmation"
              type="email"
              required
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={email ?? ""}
              disabled={pending}
              className="h-11 sm:h-10"
            />
            {state.status === "error" ? (
              <ErrorLine text={t(`deleteError.${state.messageKey}`)} />
            ) : null}

            <div className="mt-2 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                // No `destructive` Button variant in this project's UI
                // primitives (see CLAUDE.md). Compose the warning
                // surface from semantic tokens. `text-white` instead
                // of a `-foreground` pair because the project doesn't
                // ship `--destructive-foreground`.
                className="gap-1.5 border border-destructive bg-destructive text-white hover:bg-destructive/90"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                {t("deleteConfirm")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ErrorLine({ text }: { text: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="flex items-start gap-1.5 text-xs text-destructive"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
