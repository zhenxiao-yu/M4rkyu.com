"use client";

import { useActionState, useId, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTurnstile } from "@/lib/hooks/use-turnstile";
import {
  subscribeAction,
  type SubscribeActionState,
} from "@/lib/newsletter/actions";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Double-opt-in subscribe form. Only rendered where the newsletter is
 * configured (the footer checks isNewsletterConfigured server-side), so the
 * action never returns "unavailable" in practice — that branch is just a
 * belt-and-braces guard. Mirrors the contact form's honeypot + Turnstile
 * spam defenses; double opt-in means a successful submit only sends a
 * confirmation email, it doesn't subscribe anyone yet.
 */
export function SubscribeForm() {
  const t = useTranslations("Newsletter");
  const honeypotId = useId();
  const [token, setToken] = useState("");
  const [state, formAction, pending] = useActionState<
    SubscribeActionState,
    FormData
  >(subscribeAction, { status: "idle" });
  const { containerRef, enabled } = useTurnstile({
    siteKey: TURNSTILE_SITE_KEY,
    onToken: setToken,
  });

  if (state.status === "pending") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("pendingMessage")}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("emailPlaceholder")}
        </label>
        <Input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className="sm:flex-1"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {t("submitLabel")}
        </Button>
      </div>

      {/* Honeypot — off-screen, untabbable; bots fill it, humans don't. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={honeypotId}>Leave this field empty</label>
        <input
          id={honeypotId}
          name="_honeypot"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input type="hidden" name="turnstileToken" value={token} />
      {enabled ? <div ref={containerRef} className="min-h-16.25" /> : null}

      {state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          {t(state.messageKey)}
        </p>
      ) : null}
    </form>
  );
}
