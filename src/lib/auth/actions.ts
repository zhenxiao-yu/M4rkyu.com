"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveSiteOrigin, sanitizeNextPath } from "./redirect-url";
import { routing } from "@/i18n/routing";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  next: z.string().optional(),
});

const otpSchema = emailSchema.extend({
  token: z.string().trim().regex(/^\d{6,8}$/),
});

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
 * Send a magic-link email. Used by the `MagicLinkForm` client island
 * via `useActionState`. Returns a discriminated state object that
 * the form renders directly (sent confirmation / error / idle).
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
  const nextParam = parsed.data.next ? `?next=${encodeURIComponent(parsed.data.next)}` : "";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback${nextParam}`,
    },
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

/**
 * Sign out the current session. Redirects to the locale home so the
 * resulting page tree refreshes its auth-dependent server data.
 */
export async function signOutAction(locale?: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  const target = locale && routing.locales.includes(locale as (typeof routing.locales)[number])
    ? `/${locale}`
    : `/${routing.defaultLocale}`;
  revalidatePath("/", "layout");
  redirect(target);
}

// Supabase surfaces several distinct error codes for OTP verification.
// We translate them into i18n keys the form already renders. Anything
// we don't recognise falls back to a generic `otpFailed`.
function classifyOtpError(err: {
  code?: string | null;
  status?: number | null;
  message?: string | null;
}): OtpMessageKey {
  const code = err.code ?? "";
  const status = err.status ?? 0;
  const message = (err.message ?? "").toLowerCase();
  if (
    code === "otp_expired" ||
    code === "expired_token" ||
    message.includes("expired")
  ) {
    return "otpExpired";
  }
  if (isRateLimitError(err) || status === 429) {
    return "rateLimited";
  }
  return "otpFailed";
}

function isRateLimitError(err: {
  code?: string | null;
  status?: number | null;
  message?: string | null;
}): boolean {
  if (err.status === 429) return true;
  const code = err.code ?? "";
  if (code === "over_email_send_rate_limit" || code === "rate_limit_exceeded") {
    return true;
  }
  return false;
}
