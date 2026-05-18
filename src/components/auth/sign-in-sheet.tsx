"use client";

import { useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authProviderFlags } from "@/lib/auth/provider-flags";
import { OAuthButtons } from "./oauth-buttons";
import { AuthForm } from "./auth-form";

interface SignInSheetProps {
  /**
   * Optional custom trigger. When omitted, a default "Sign in" button
   * renders. Pass a `<Button asChild>` or another interactive element
   * for inline triggers ("Sign in to save", "Sign in to comment").
   */
  trigger?: ReactNode;
  /** Path to redirect to after a successful sign-in. Same-origin only. */
  next?: string;
  /** Controlled open state for programmatic triggers (e.g. ?signIn=1). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SignInSheet({
  trigger,
  next,
  open,
  onOpenChange,
}: SignInSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) onOpenChange?.(value);
    else setInternalOpen(value);
  };

  const t = useTranslations("Auth");
  const providers = authProviderFlags();
  const oauthEnabled = providers.google || providers.github;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label={t("signIn")}
          >
            <LogIn className="size-4" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">{t("signIn")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("signInTitle")}</DialogTitle>
          <DialogDescription>{t("signInDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {oauthEnabled ? (
            <>
              <OAuthButtons next={next} />

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {t("or")}
                </span>
                <div className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
            </>
          ) : null}

          {/*
           * `key` bound to open state so closing the dialog resets the
           * AuthForm action state (otherwise the user reopens to a
           * "sent" view even when they meant to start over).
           */}
          <AuthForm key={isOpen ? "open" : "closed"} next={next} />

          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
            {t("signInTos")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
