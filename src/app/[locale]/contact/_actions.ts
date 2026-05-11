"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { inquirySchema, type InquiryFieldName } from "@/lib/forms/inquiry-schema";
import { getResendClient } from "@/lib/email/client";
import {
  InquiryEmail,
  renderInquiryText,
} from "@/lib/email/templates/inquiry";
import { verifyTurnstileToken } from "@/lib/server/turnstile";
import { env } from "@/lib/env";

export type InquiryActionState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      kind: "validation";
      // Localised error keys keyed by field name; the form maps them
      // to `t(`Contact.${value}`)` for display.
      fieldErrors: Partial<Record<InquiryFieldName, string>>;
    }
  | {
      status: "error";
      kind: "spam" | "send" | "unknown";
      // Single message key the form looks up via t("Contact.<key>").
      messageKey: string;
    };

export const idleInquiryState: InquiryActionState = { status: "idle" };

/**
 * Server action behind the /contact form. Wired through
 * `useActionState` on the client.
 *
 * Flow:
 *   1. Pull fields from FormData → parse with the shared Zod schema.
 *      Localised error keys come back to the client unchanged.
 *   2. Honeypot check: a non-empty `_honeypot` field returns success
 *      silently — never tip off the bot.
 *   3. Verify Turnstile (no-op when unconfigured for local dev).
 *   4. Send via Resend; React Email renders the HTML, plaintext
 *      fallback ships alongside.
 *   5. Return a discriminated state the client renders as toast +
 *      form reset.
 *
 * Telemetry is intentionally console-only for now — Vercel's runtime
 * captures it, Resend's dashboard is the audit log. A DB-backed log
 * lands later if volume justifies it (see plan §"Forward-compat").
 */
export async function submitInquiryAction(
  _prevState: InquiryActionState,
  formData: FormData,
): Promise<InquiryActionState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    projectType: formData.get("projectType"),
    message: formData.get("message"),
    _honeypot: formData.get("_honeypot") ?? "",
    turnstileToken: formData.get("turnstileToken") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      kind: "validation",
      fieldErrors: collectFieldErrors(parsed.error),
    };
  }

  // Silent honeypot — pretend the inquiry sent so the bot moves on.
  // Don't actually call Resend.
  if (parsed.data._honeypot) {
    return { status: "success" };
  }

  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("cf-connecting-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined;

  const turnstile = await verifyTurnstileToken(
    parsed.data.turnstileToken,
    clientIp,
  );
  if (!turnstile.ok) {
    return {
      status: "error",
      kind: "spam",
      messageKey: "spamReject",
    };
  }

  const receivedAt = new Date().toUTCString();

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: env.INQUIRY_FROM_EMAIL,
      to: env.INQUIRY_TO_EMAIL,
      // Sender's address as replyTo so Mark can hit reply and land in
      // the visitor's inbox.
      replyTo: parsed.data.email,
      subject: `Project inquiry — ${parsed.data.projectType}`,
      react: InquiryEmail({
        payload: {
          name: parsed.data.name,
          email: parsed.data.email,
          projectType: parsed.data.projectType,
          message: parsed.data.message,
        },
        receivedAt,
      }),
      text: renderInquiryText({
        payload: {
          name: parsed.data.name,
          email: parsed.data.email,
          projectType: parsed.data.projectType,
          message: parsed.data.message,
        },
        receivedAt,
      }),
    });

    if (error) {
      console.error("[inquiry] resend error", error);
      return { status: "error", kind: "send", messageKey: "sendError" };
    }
  } catch (err) {
    console.error("[inquiry] unexpected error", err);
    return { status: "error", kind: "unknown", messageKey: "unknownError" };
  }

  return { status: "success" };
}

function collectFieldErrors(
  error: z.ZodError,
): Partial<Record<InquiryFieldName, string>> {
  const out: Partial<Record<InquiryFieldName, string>> = {};
  for (const issue of error.issues) {
    const head = issue.path[0];
    if (
      typeof head === "string" &&
      (head === "name" ||
        head === "email" ||
        head === "projectType" ||
        head === "message")
    ) {
      if (!out[head]) {
        out[head] = issue.message;
      }
    }
  }
  return out;
}
