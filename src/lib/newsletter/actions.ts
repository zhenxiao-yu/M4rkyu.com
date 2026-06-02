"use server";

import { headers } from "next/headers";
import { subscribeSchema } from "@/lib/newsletter/subscribe-schema";
import { signSubscribeToken } from "@/lib/newsletter/token";
import { isNewsletterConfigured, newsletterFromEmail } from "@/lib/newsletter/config";
import { getResendClient } from "@/lib/email/client";
import {
  NewsletterConfirmEmail,
  renderNewsletterConfirmText,
} from "@/lib/email/templates/newsletter";
import { verifyTurnstileToken } from "@/lib/server/turnstile";
import { SITE_URL } from "@/lib/seo/site";
import { env } from "@/lib/env";

export type SubscribeActionState =
  | { status: "idle" }
  // Confirmation email sent — visitor must click the link (double opt-in).
  | { status: "pending" }
  | {
      status: "error";
      kind: "validation" | "spam" | "send" | "unavailable" | "unknown";
      // Single key the form looks up via t("Newsletter.<key>").
      messageKey: string;
    };

// Newsletter subscribe: Zod parse → gate → silent honeypot → Turnstile →
// signed double-opt-in token → confirmation email. No contact is added to
// the audience until the link is clicked (the /api/newsletter/confirm route).
export async function subscribeAction(
  _prevState: SubscribeActionState,
  formData: FormData,
): Promise<SubscribeActionState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    _honeypot: formData.get("_honeypot") ?? "",
    turnstileToken: formData.get("turnstileToken") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", kind: "validation", messageKey: "invalidEmail" };
  }

  if (!isNewsletterConfigured()) {
    return { status: "error", kind: "unavailable", messageKey: "unavailable" };
  }

  // Silent honeypot — pretend it worked so the bot moves on.
  if (parsed.data._honeypot) {
    return { status: "pending" };
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
    return { status: "error", kind: "spam", messageKey: "spamReject" };
  }

  const secret = env.NEWSLETTER_TOKEN_SECRET;
  const from = newsletterFromEmail();
  if (!secret || !from) {
    return { status: "error", kind: "unavailable", messageKey: "unavailable" };
  }

  try {
    const token = signSubscribeToken(parsed.data.email, secret, Date.now());
    const confirmLink = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to: parsed.data.email,
      subject: "Confirm your subscription — m4rkyu.com",
      react: NewsletterConfirmEmail({ confirmLink }),
      text: renderNewsletterConfirmText({ confirmLink }),
    });
    if (error) {
      console.error("[newsletter] resend error", error);
      return { status: "error", kind: "send", messageKey: "sendError" };
    }
  } catch (err) {
    console.error("[newsletter] unexpected error", err);
    return { status: "error", kind: "unknown", messageKey: "unknownError" };
  }

  return { status: "pending" };
}
