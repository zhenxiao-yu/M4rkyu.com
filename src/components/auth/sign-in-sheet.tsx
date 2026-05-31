"use client";

import { useState, type ReactNode } from "react";
import { LogIn, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authProviderFlags } from "@/lib/auth/provider-flags";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
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
  const oauthEnabled = providers.google || providers.github || providers.discord;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 whitespace-nowrap"
            aria-label={t("signIn")}
          >
            <LogIn className="size-4" aria-hidden="true" />
            <span className="hidden min-[380px]:inline">{t("signIn")}</span>
          </Button>
        )}
      </DialogTrigger>
      {/* Credential Plate — the auth modal is reframed as an issued press
       * pass for the site. Glass surface, pixel-font plate index, vertical
       * ring rule on the title, hairline-and-dot divider, magazine-TOC
       * underline mode-nav. Extends the curator's-plate language from the
       * gallery lightbox and the OPS-channel idiom from /admin so this
       * doesn't read as a separate aesthetic. */}
      <DialogContent
        hideCloseButton
        className="glass-surface max-w-sm rounded-[1.25rem] border-0 p-0 text-popover-foreground shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
      >
        {/* Plate anchor — top-right (next to the close button), mirrors
         * the gallery lightbox's "PLATE NN / NN" mark. The "01" is
         * decorative — there is only one credential — but the format
         * quietly asserts that this site has a design language. Pixel
         * font auto-swaps to the sans display stack on CJK contexts via
         * the :lang(zh) guard in globals.css. */}
        <div className="pointer-events-none absolute right-14 top-5 z-10 inline-flex items-baseline gap-1.5">
          <span
            aria-hidden="true"
            className="font-pixel text-base leading-none uppercase tracking-wide text-muted-foreground/65"
          >
            PASS
          </span>
          <span
            aria-hidden="true"
            className="font-pixel text-base leading-none text-muted-foreground/65 tabular-nums"
          >
            01
            <span className="mx-0.5 text-muted-foreground/40">/</span>
            01
          </span>
        </div>

        <DialogClose
          aria-label={t("signIn")}
          className={cn(
            "absolute right-5 top-5 z-10 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
            FOCUS_RING_INSET,
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">{t("signIn")}</span>
        </DialogClose>

        {/* Wall-label header — vertical ring-tinted hairline rule does the
         * hierarchical work; the title sits unadorned. Same idiom as the
         * lightbox sidebar's detail-view panel, so the visual grammar is
         * internally coherent. */}
        <div className="relative px-6 pb-4 pt-6 pl-7">
          <span
            aria-hidden="true"
            className="absolute left-4 top-7 bottom-4 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent"
          />
          <DialogHeader className="gap-2">
            <DialogTitle className="text-balance text-xl font-semibold leading-tight">
              {t("signInTitle")}
            </DialogTitle>
            <DialogDescription className="text-balance text-sm leading-5">
              {t("signInDescription")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          {oauthEnabled ? (
            <>
              <OAuthButtons next={next} />

              {/* Hairline-and-dot divider — the "or" word is unnecessary
               * chrome; a thin ring-tinted rule split by a center dot
               * carries the same intent with more typographic restraint. */}
              <div
                aria-hidden="true"
                className="flex items-center gap-3 py-1"
              >
                <span className="h-px flex-1 bg-linear-to-r from-transparent via-border to-border" />
                <span className="size-1 rounded-full bg-ring/55" />
                <span className="h-px flex-1 bg-linear-to-r from-border via-border to-transparent" />
              </div>
              <span className="sr-only">{t("or")}</span>
            </>
          ) : null}

          {/*
           * `key` bound to open state so closing the dialog resets the
           * AuthForm action state (otherwise the user reopens to a
           * "sent" view even when they meant to start over).
           */}
          <AuthForm key={isOpen ? "open" : "closed"} next={next} />

          <div className="relative pt-3">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-border/70"
            />
            <p className="font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
              {t("signInTos")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
