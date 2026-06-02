import "server-only";

import { env } from "@/lib/env";

/**
 * The newsletter ships dark until every required key is set, mirroring
 * isStripeConfigured(). The UI hides the form and the action returns a
 * graceful "unavailable" state when this is false, so builds + preview
 * deploys without Resend Audience keys stay green.
 */
export function isNewsletterConfigured(): boolean {
  return Boolean(
    env.RESEND_API_KEY &&
      env.RESEND_AUDIENCE_ID &&
      env.NEWSLETTER_TOKEN_SECRET,
  );
}

/** Sender for newsletter mail; falls back to the inquiry sender. */
export function newsletterFromEmail(): string | undefined {
  return env.NEWSLETTER_FROM_EMAIL ?? env.INQUIRY_FROM_EMAIL;
}
