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

// Supabase hashes passwords with bcrypt, which silently truncates
// inputs past 72 bytes. We refuse them outright so a longer password
// doesn't auth correctly only because the truncated prefix matches.
const passwordSchema = z
  .string()
  .min(8, "passwordTooShort")
  .max(72, "passwordTooLong");

const credentialSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  next: z.string().optional(),
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

type PasswordSignInMessageKey =
  | "unconfigured"
  | "invalidInput"
  | "invalidCredentials"
  | "unconfirmedEmail"
  | "rateLimited";

type PasswordSignInState =
  | { status: "idle" }
  | { status: "error"; messageKey: PasswordSignInMessageKey };

type SignUpMessageKey =
  | "unconfigured"
  | "invalidInput"
  | "weakPassword"
  | "userAlreadyExists"
  | "signUpFailed"
  | "rateLimited";

type SignUpState =
  | { status: "idle" }
  | { status: "confirmSent"; email: string }
  | { status: "error"; messageKey: SignUpMessageKey };

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
 * Sign in an existing account with email + password. Redirects on
 * success; returns a discriminated error state for the form to
 * render otherwise.
 *
 * The error mapping mirrors Supabase's documented codes:
 *   - `invalid_credentials` (wrong email/password) — generic, by design
 *   - `email_not_confirmed` — account exists but signup not completed
 *   - `over_request_rate_limit` / status 429 — throttled
 */
export async function signInWithPasswordAction(
  _prevState: PasswordSignInState,
  formData: FormData,
): Promise<PasswordSignInState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const parsed = credentialSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { status: "error", messageKey: "invalidInput" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] password sign-in failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    if (isRateLimitError(error)) {
      return { status: "error", messageKey: "rateLimited" };
    }
    if (error.code === "email_not_confirmed") {
      return { status: "error", messageKey: "unconfirmedEmail" };
    }
    return { status: "error", messageKey: "invalidCredentials" };
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
 * Create a new account with email + password. Returns a
 * `confirmSent` state when Supabase's project requires email
 * confirmation (the typical default), or redirects directly when
 * confirmation is disabled and a session is created on signup.
 *
 * NOTE on account-enumeration: Supabase returns success (no error,
 * no session) for re-signup attempts on an existing unconfirmed
 * account. We surface the same "check your email" message either
 * way — the existing account holder gets no extra email; the new
 * signup gets the confirmation link. This is intentional.
 */
export async function signUpWithPasswordAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const parsed = credentialSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    next: String(formData.get("next") ?? "") || undefined,
  });
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (
      firstIssue?.message === "passwordTooShort" ||
      firstIssue?.message === "passwordTooLong"
    ) {
      return { status: "error", messageKey: "weakPassword" };
    }
    return { status: "error", messageKey: "invalidInput" };
  }

  const requestHeaders = await headers();
  const origin = resolveSiteOrigin(requestHeaders.get("origin"));
  const nextParam = parsed.data.next
    ? `?next=${encodeURIComponent(parsed.data.next)}`
    : "";

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback${nextParam}`,
    },
  });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] signup failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    if (isRateLimitError(error)) {
      return { status: "error", messageKey: "rateLimited" };
    }
    if (
      error.code === "user_already_exists" ||
      error.code === "email_exists"
    ) {
      return { status: "error", messageKey: "userAlreadyExists" };
    }
    if (error.code === "weak_password") {
      return { status: "error", messageKey: "weakPassword" };
    }
    return { status: "error", messageKey: "signUpFailed" };
  }

  // When Supabase's "Confirm email" setting is disabled, signUp
  // returns a session immediately and we can redirect. Otherwise
  // surface the "check your inbox" state.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(
      sanitizeNextPath(
        parsed.data.next ?? `/${routing.defaultLocale}`,
        `/${routing.defaultLocale}`,
      ),
    );
  }

  return { status: "confirmSent", email: parsed.data.email };
}

/**
 * Sign out the current session. Redirects to the locale home so the
 * resulting page tree refreshes its auth-dependent server data.
 *
 * Pass `scope: "global"` to revoke every active session for this user
 * (across all devices). Default `"local"` only kills the session
 * bound to the current cookie.
 */
export async function signOutAction(
  locale?: string,
  scope: "local" | "global" = "local",
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope });
  }
  const target =
    locale && routing.locales.includes(locale as (typeof routing.locales)[number])
      ? `/${locale}`
      : `/${routing.defaultLocale}`;
  revalidatePath("/", "layout");
  redirect(target);
}

type UpdatePasswordMessageKey =
  | "unconfigured"
  | "guest"
  | "weakPassword"
  | "rateLimited"
  | "updateFailed";

export type UpdatePasswordState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; messageKey: UpdatePasswordMessageKey };

/**
 * Set or change the signed-in user's password. Used by the account
 * settings form (any user) AND by users who land via the magic-link
 * recovery flow and want to add a password.
 *
 * Reuses the same 8-72 char schema as signUp — bcrypt truncates past
 * 72 bytes so we refuse rather than silently match a prefix.
 */
export async function updatePasswordAction(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  // Re-derive the user from the cookie session — never trust a
  // user_id passed in form data.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const parsed = passwordSchema.safeParse(
    String(formData.get("password") ?? ""),
  );
  if (!parsed.success) {
    return { status: "error", messageKey: "weakPassword" };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] password update failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    if (isRateLimitError(error)) {
      return { status: "error", messageKey: "rateLimited" };
    }
    if (error.code === "weak_password") {
      return { status: "error", messageKey: "weakPassword" };
    }
    return { status: "error", messageKey: "updateFailed" };
  }

  revalidatePath("/", "layout");
  return { status: "ok" };
}

type DeleteAccountMessageKey =
  | "unconfigured"
  | "guest"
  | "confirmationMismatch"
  | "deleteFailed";

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "error"; messageKey: DeleteAccountMessageKey };

/**
 * Permanently delete the signed-in user's account.
 *
 * The user types their email into the confirmation field; we compare
 * it (case-insensitive) against the session email before invoking
 * the `public.delete_my_account()` RPC. The RPC itself is gated by
 * `auth.uid()` so even if a malicious client skipped this UI check,
 * RLS / function permissions stop them from deleting someone else.
 *
 * On success: sign out + redirect to the locale home.
 */
export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const typed = String(formData.get("confirmation") ?? "")
    .trim()
    .toLowerCase();
  const sessionEmail = (user.email ?? "").trim().toLowerCase();
  if (!sessionEmail || typed !== sessionEmail) {
    return { status: "error", messageKey: "confirmationMismatch" };
  }

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] delete account failed", {
        message: error.message,
        code: error.code,
      });
    }
    return { status: "error", messageKey: "deleteFailed" };
  }

  // Account is gone — clear the cookie session and bounce home.
  await supabase.auth.signOut();
  const rawLocale = String(formData.get("locale") ?? routing.defaultLocale);
  const target = routing.locales.includes(
    rawLocale as (typeof routing.locales)[number],
  )
    ? `/${rawLocale}`
    : `/${routing.defaultLocale}`;
  revalidatePath("/", "layout");
  redirect(`${target}?accountDeleted=1`);
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
