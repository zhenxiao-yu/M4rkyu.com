"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  getAdminSupabaseClient,
  isFastAuthEmailConfigured,
} from "@/lib/supabase/admin";
import { getResendClient } from "@/lib/email/client";
import {
  MagicLinkEmail,
  renderMagicLinkText,
} from "@/lib/email/templates/magic-link";
import { env } from "@/lib/env";
import { resolveSiteOrigin, sanitizeNextPath } from "../redirect-url";
import {
  classifyOtpError,
  clientIpFromHeaders,
  isRateLimitError,
  isUserNotFoundError,
} from "../error-classify";
import { routing } from "@/i18n/routing";
import { emailSchema, otpSchema } from "./schemas";

type MagicLinkMessageKey =
  | "unconfigured"
  | "invalidEmail"
  | "sendFailed"
  | "rateLimited";

type MagicLinkState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; messageKey: MagicLinkMessageKey };

type OtpMessageKey =
  | "unconfigured"
  | "invalidOtp"
  | "otpFailed"
  | "otpExpired"
  | "rateLimited";

type VerifyOtpState =
  | { status: "idle" }
  | { status: "error"; messageKey: OtpMessageKey };

/**
 * Send a magic-link email.
 *
 * Two code paths, picked by `isFastAuthEmailConfigured()`:
 *
 *   1. Fast path (SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY set)
 *      - admin.generateLink mints the link + OTP without triggering
 *        Supabase's slow built-in email pipeline (typical 30–60s
 *        delivery on the free tier).
 *      - Resend sends the email with our own branded template.
 *      - Typical delivery: 2–5s.
 *
 *   2. Slow fallback (default Supabase auth email)
 *      - signInWithOtp asks Supabase to mint + send the email.
 *      - Works with zero extra setup but is slower and capped at
 *        Supabase's project-level email quota.
 *
 * Either path is rate-limited via `record_email_send()` (RPC defined
 * in the Supabase email-rate-limit migrations) — currently 5 sends
 * per email per 60s + 30 sends per IP per 10 minutes.
 */
export async function requestMagicLinkAction(
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const parsed = emailSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", messageKey: "invalidEmail" };
  }

  const requestHeaders = await headers();
  const origin = resolveSiteOrigin(requestHeaders.get("origin"));
  const ip = clientIpFromHeaders(requestHeaders);
  const nextParam = parsed.data.next
    ? `?next=${encodeURIComponent(parsed.data.next)}`
    : "";
  const redirectTo = `${origin}/auth/callback${nextParam}`;

  // App-level rate limit. The RPC enforces it server-side regardless
  // of which sending path follows, so a misconfigured admin client
  // (which would bypass Supabase's own throttle) still respects it.
  const supabase = await createSupabaseServerClient();
  const rate = await supabase.rpc("record_email_send", {
    p_email: parsed.data.email,
    p_ip: ip,
  });
  if (rate.error) {
    if ((rate.error as { code?: string }).code === "P0001") {
      return { status: "error", messageKey: "rateLimited" };
    }
    // The rate-limit table isn't load-bearing for correctness — if
    // the RPC itself errors (e.g. migration not applied yet) we log
    // and continue rather than block the user.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] email rate-limit RPC failed; allowing send", {
        message: rate.error.message,
      });
    }
  }

  if (isFastAuthEmailConfigured()) {
    const fastResult = await sendMagicLinkViaResend({
      email: parsed.data.email,
      redirectTo,
      origin,
    });
    if (fastResult === "ok") {
      return { status: "sent", email: parsed.data.email };
    }
    if (fastResult === "rateLimited") {
      return { status: "error", messageKey: "rateLimited" };
    }
    // The fast path failed for a reason that isn't "rate-limited" —
    // fall through to the slow path so the user still gets an email.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] fast magic-link path failed, falling back");
    }
  }

  // Slow fallback: Supabase mints + sends.
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] magic link send failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    if (isRateLimitError(error)) {
      return { status: "error", messageKey: "rateLimited" };
    }
    return { status: "error", messageKey: "sendFailed" };
  }
  return { status: "sent", email: parsed.data.email };
}

/**
 * Mint a magic link via admin.generateLink and send it through
 * Resend. Returns "ok" on success, "rateLimited" if Supabase
 * refuses (still possible at the auth-layer even with the service
 * role), or "failed" for anything we couldn't classify — the caller
 * falls back to signInWithOtp in that case.
 *
 * Creates the user on the fly when generateLink reports them
 * missing (Supabase requires the user to exist for type='magiclink').
 */
async function sendMagicLinkViaResend({
  email,
  redirectTo,
  origin,
}: {
  email: string;
  redirectTo: string;
  origin: string;
}): Promise<"ok" | "rateLimited" | "failed"> {
  const admin = getAdminSupabaseClient();
  if (!admin) return "failed";

  let linkResult = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  // The user doesn't exist yet — create them and try again. Magic
  // link is the user-creation path for password-less accounts, so
  // auto-creation here matches what `signInWithOtp` does by default.
  if (linkResult.error && isUserNotFoundError(linkResult.error)) {
    const create = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (create.error) {
      if (isRateLimitError(create.error)) return "rateLimited";
      if (process.env.NODE_ENV !== "production") {
        console.error("[auth] admin createUser failed", create.error);
      }
      return "failed";
    }
    linkResult = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
  }

  if (linkResult.error || !linkResult.data) {
    if (linkResult.error && isRateLimitError(linkResult.error)) {
      return "rateLimited";
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] admin generateLink failed", linkResult.error);
    }
    return "failed";
  }

  const actionLink = linkResult.data.properties?.action_link;
  const otp = linkResult.data.properties?.email_otp;
  if (!actionLink || !otp) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] generateLink returned no link/otp");
    }
    return "failed";
  }

  const resend = getResendClient();
  if (!env.INQUIRY_FROM_EMAIL) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] fast magic-link sender env is not configured");
    }
    return "failed";
  }
  const host = origin.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const { error: sendError } = await resend.emails.send({
    from: env.INQUIRY_FROM_EMAIL,
    to: email,
    subject: `Your sign-in link for ${host}`,
    react: MagicLinkEmail({ actionLink, otp, site: host }),
    text: renderMagicLinkText({ actionLink, otp, site: host }),
  });
  if (sendError) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] resend send failed", sendError);
    }
    return "failed";
  }
  return "ok";
}

export async function verifyEmailOtpAction(
  _prevState: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const parsed = otpSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    token: String(formData.get("token") ?? "").replace(/\s+/g, ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", messageKey: "invalidOtp" };
  }

  const supabase = await createSupabaseServerClient();
  const magicLinkAttempt = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "magiclink",
  });
  const emailAttempt = magicLinkAttempt.error
    ? await supabase.auth.verifyOtp({
        email: parsed.data.email,
        token: parsed.data.token,
        type: "email",
      })
    : null;
  const error = emailAttempt?.error ?? magicLinkAttempt.error;

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] otp verify failed", {
        magiclink: {
          message: magicLinkAttempt.error?.message,
          status: magicLinkAttempt.error?.status,
          code: magicLinkAttempt.error?.code,
        },
        email: emailAttempt
          ? {
              message: emailAttempt.error?.message,
              status: emailAttempt.error?.status,
              code: emailAttempt.error?.code,
            }
          : null,
      });
    }
    return { status: "error", messageKey: classifyOtpError(error) };
  }

  revalidatePath("/", "layout");
  redirect(
    sanitizeNextPath(
      parsed.data.next ?? `/${routing.defaultLocale}`,
      `/${routing.defaultLocale}`,
    ),
  );
}
