"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { CopyEmailButton } from "./_copy-email-button";
import { useTurnstile } from "@/lib/hooks/use-turnstile";
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

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting, dirtyFields, touchedFields },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues,
    mode: "onBlur",
  });

  // Bridge RHF submit into a transition so the button can show pending without losing per-field UX.
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<InquiryActionState | null>(null);

  const {
    containerRef: turnstileRef,
    reset: resetTurnstile,
    enabled: turnstileEnabled,
  } = useTurnstile({
    siteKey: TURNSTILE_SITE_KEY,
    onToken: (token) => setValue("turnstileToken", token),
  });

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

  // Effect (not in onValid) so the transition's pending flag flushes before the toast.
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

  const submitting = pending || isSubmitting;

  // A field shows its success tick once the visitor has touched/edited it
  // (mode "onBlur") and it currently carries no validation error.
  const isFieldValid = (field: keyof InquiryInput) =>
    Boolean((dirtyFields[field] || touchedFields[field]) && !errors[field]);

  return (
    <>
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}

      <form
        className="flex flex-1 flex-col gap-5"
        aria-describedby="contact-form-note"
        onSubmit={handleSubmit(onValid)}
        noValidate
      >
        <FormField
          control={control}
          name="name"
          label={t("nameLabel")}
          valid={isFieldValid("name")}
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
          valid={isFieldValid("email")}
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
          valid={isFieldValid("projectType")}
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
          valid={isFieldValid("message")}
          className="!flex flex-1 flex-col gap-2"
          errorMessage={errors.message ? resolveError(t, errors.message.message) : undefined}
          render={({ id, name, value, onChange, onBlur, "aria-invalid": ai, "aria-describedby": ad }) => (
            <textarea
              id={id}
              name={name}
              rows={5}
              className="min-h-32 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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

        {turnstileEnabled ? (
          <div ref={turnstileRef} className="min-h-16.25" />
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
          <CopyEmailButton email={email} />
        </div>
      </form>
    </>
  );
}

// Zod messages are i18n keys; fall back to raw string if a future schema author writes a literal.
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

