import { type NextRequest, NextResponse } from "next/server";
import { verifySubscribeToken } from "@/lib/newsletter/token";
import {
  isNewsletterConfigured,
  newsletterFromEmail,
} from "@/lib/newsletter/config";
import { getResendClient } from "@/lib/email/client";
import {
  NewsletterWelcomeEmail,
  renderNewsletterWelcomeText,
} from "@/lib/email/templates/newsletter";
import { SITE_URL } from "@/lib/seo/site";
import { env } from "@/lib/env";

// Double-opt-in confirmation. The signed token IS the pending state, so
// there's no DB row to look up: verify → add to the Resend Audience → send
// the welcome email → redirect to the confirmed page. Node runtime (Resend
// SDK); never edge.
export async function GET(request: NextRequest) {
  const confirmed = `${SITE_URL}/en/newsletter/confirmed`;

  if (!isNewsletterConfigured() || !env.RESEND_AUDIENCE_ID) {
    return NextResponse.redirect(`${confirmed}?state=unavailable`);
  }

  const token = request.nextUrl.searchParams.get("token") ?? "";
  const secret = env.NEWSLETTER_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.redirect(`${confirmed}?state=unavailable`);
  }

  const result = verifySubscribeToken(token, secret, Date.now());
  if (!result.ok) {
    const state = result.reason === "expired" ? "expired" : "invalid";
    return NextResponse.redirect(`${confirmed}?state=${state}`);
  }

  try {
    const resend = getResendClient();
    await resend.contacts.create({
      audienceId: env.RESEND_AUDIENCE_ID,
      email: result.email,
      unsubscribed: false,
    });
    const from = newsletterFromEmail();
    if (from) {
      const homeLink = `${SITE_URL}/en/latest`;
      await resend.emails.send({
        from,
        to: result.email,
        subject: "You're subscribed — m4rkyu.com",
        react: NewsletterWelcomeEmail({ homeLink }),
        text: renderNewsletterWelcomeText({ homeLink }),
      });
    }
  } catch (err) {
    // The visitor already proved intent by clicking; a transient Resend
    // error (or an already-existing contact) shouldn't show a failure.
    // Re-confirming is idempotent, so we still land them on success.
    console.error("[newsletter] confirm error", err);
  }

  return NextResponse.redirect(`${confirmed}?state=ok`);
}
