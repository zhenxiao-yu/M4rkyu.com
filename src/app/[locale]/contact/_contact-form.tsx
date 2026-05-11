"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import {
  inquirySchema,
  type InquiryInput,
} from "@/lib/forms/inquiry-schema";
import {
  submitInquiryAction,
  type InquiryActionState,
} from "./_actions";

/**
 * Public-only env var. Doesn't need the t3-env layer because it's
 * inlined at build time and always safe to read in client code.
 */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type ContactKey = Parameters<ReturnType<typeof useTranslations<"Contact">>>[0];

const defaultValues: InquiryInput = {
  name: "",
  email: "",
  projectType: "",
  message: "",
  _honeypot: "",
  turnstileToken: "",
};

export function ContactForm({ email }: { email: string }) {
  const t = useTranslations("Contact");
  const honeypotId = useId();
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues,
    mode: "onBlur",
  });

  // Server action drives the actual send. We bridge react-hook-form's
  // submit handler into a transition so the form button can show a
  // pending state without giving up RHF's per-field validation UX.
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<InquiryActionState | null>(null);

  // Stable across renders so it can be a dep of the result-handling
  // effect without re-firing each render. Declared with useCallback
  // before any effect that references it.
  const resetTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileWidgetIdRef.current) return;
    const win = window as unknown as { turnstile?: TurnstileApi };
    win.turnstile?.reset(turnstileWidgetIdRef.current);
    setValue("turnstileToken", "");
  }, [setValue]);

  async function onValid(values: InquiryInput) {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("email", values.email);
    formData.set("projectType", values.projectType);
    formData.set("message", values.message);
    formData.set("_honeypot", values._honeypot ?? "");
    formData.set("turnstileToken", values.turnstileToken ?? "");

    startTransition(async () => {
      const result = await submitInquiryAction({ status: "idle" }, formData);
      setLastResult(result);
    });
  }

  // Map server-action result into RHF errors / toasts. Kept in an
  // effect (not inside `onValid`) so `useTransition`'s pending flag
  // flushes first, avoiding a stale toast before the spinner ends.
  useEffect(() => {
    if (!lastResult) return;
    if (lastResult.status === "success") {
      toast.success(t("successTitle"), { description: t("successBody") });
      reset(defaultValues);
      resetTurnstile();
      return;
    }
    if (lastResult.status === "error" && lastResult.kind === "validation") {
      for (const [field, key] of Object.entries(lastResult.fieldErrors)) {
        if (!key) continue;
        setError(field as keyof InquiryInput, {
          type: "server",
          // The schema returns a translation *key* (e.g. "nameError"),
          // which the FormField resolves via `t()` below.
          message: key,
        });
      }
      return;
    }
    if (lastResult.status === "error") {
      toast.error(t(lastResult.messageKey as ContactKey));
      resetTurnstile();
    }
  }, [lastResult, reset, resetTurnstile, setError, t]);

  // Turnstile widget: only renders when the public site key is set.
  // We load the script once and call `window.turnstile.render` so we
  // can wire the success callback into RHF's `turnstileToken` field.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    function renderWidget() {
      const win = window as unknown as { turnstile?: TurnstileApi };
      if (!win.turnstile || !turnstileContainerRef.current) return;
      if (turnstileWidgetIdRef.current) return;
      turnstileWidgetIdRef.current = win.turnstile.render(
        turnstileContainerRef.current,
        {
          sitekey: TURNSTILE_SITE_KEY!,
          callback: (token: string) => setValue("turnstileToken", token),
          "error-callback": () => setValue("turnstileToken", ""),
          "expired-callback": () => setValue("turnstileToken", ""),
          theme: "auto",
          appearance: "interaction-only",
        },
      );
    }
    // Script may already have loaded earlier; cover both paths.
    renderWidget();
    const id = window.setInterval(renderWidget, 200);
    const stop = window.setTimeout(() => window.clearInterval(id), 4000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [setValue]);

  const submitting = pending || isSubmitting;

  return (
    <>
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}

      <form
        className="grid gap-5"
        aria-describedby="contact-form-note"
        onSubmit={handleSubmit(onValid)}
        noValidate
      >
        <FormField
          control={control}
          name="name"
          label={t("nameLabel")}
          errorMessage={errors.name ? resolveError(t, errors.name.message) : undefined}
          inputProps={{
            placeholder: t("namePlaceholder"),
            autoComplete: "name",
          }}
        />
        <FormField
          control={control}
          name="email"
          label={t("emailLabel")}
          errorMessage={errors.email ? resolveError(t, errors.email.message) : undefined}
          inputProps={{
            type: "email",
            placeholder: t("emailPlaceholder"),
            autoComplete: "email",
            spellCheck: false,
          }}
        />
        <FormField
          control={control}
          name="projectType"
          label={t("projectTypeLabel")}
          errorMessage={
            errors.projectType ? resolveError(t, errors.projectType.message) : undefined
          }
          inputProps={{
            placeholder: t("projectTypePlaceholder"),
            autoComplete: "off",
          }}
        />
        <FormField
          control={control}
          name="message"
          label={t("messageLabel")}
          errorMessage={errors.message ? resolveError(t, errors.message.message) : undefined}
          render={({ id, name, value, onChange, onBlur, "aria-invalid": ai, "aria-describedby": ad }) => (
            <textarea
              id={id}
              name={name}
              rows={7}
              className="min-h-36 rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={t("messagePlaceholder")}
              value={typeof value === "string" ? value : ""}
              onChange={(event) => onChange(event.target.value)}
              onBlur={onBlur}
              aria-invalid={ai}
              aria-describedby={ad}
            />
          )}
        />

        {/* Honeypot: visually hidden, tab-skipped, autocomplete off. Bots
          * fill every field; humans never see this one. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={honeypotId}>{t("honeypotLabel")}</label>
          <input
            id={honeypotId}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("_honeypot")}
          />
        </div>

        {TURNSTILE_SITE_KEY ? (
          <div ref={turnstileContainerRef} className="min-h-16.25" />
        ) : null}

        <p id="contact-form-note" className="text-sm leading-6 text-muted-foreground">
          {t("formNote")}
        </p>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            <Send className="size-4" aria-hidden="true" />
            {submitting ? t("formSubmitting") : t("formSubmit")}
          </Button>
          <Button asChild variant="outline">
            <a href={`mailto:${email}`}>
              <Mail className="size-4" aria-hidden="true" />
              {t("formDirect")}
            </a>
          </Button>
        </div>
      </form>
    </>
  );
}

/**
 * Resolve a Zod error message key into a localised string. The shared
 * schema sets the message to a translation key (e.g. "nameError") so
 * client + server validation share the same source of truth. Falls
 * back to the raw message if it doesn't look like a key — defensive
 * against future schema authors using literal strings by mistake.
 */
function resolveError(
  t: ReturnType<typeof useTranslations<"Contact">>,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined;
  try {
    return t(message as ContactKey);
  } catch {
    return message;
  }
}

/** Minimal Turnstile API surface we use. */
type TurnstileApi = {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      callback?: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
      appearance?: "always" | "execute" | "interaction-only";
    },
  ) => string;
  reset: (widgetId?: string) => void;
};
