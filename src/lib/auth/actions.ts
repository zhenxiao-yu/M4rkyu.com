"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
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
import { resolveSiteOrigin, sanitizeNextPath } from "./redirect-url";
import { routing } from "@/i18n/routing";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  next: z.string().optional(),
});

const otpSchema = emailSchema.extend({
  token: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/),
});

// Reject >72 bytes — bcrypt truncates, which would let a longer password auth via prefix match.
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

function isUserNotFoundError(err: {
  code?: string | null;
  status?: number | null;
  message?: string | null;
}): boolean {
  const code = err.code ?? "";
  if (code === "user_not_found") return true;
  if (err.status === 404) return true;
  const message = (err.message ?? "").toLowerCase();
  return message.includes("user not found") || message.includes("no user");
}

/**
 * Best-effort client IP extraction from the request headers Vercel
 * (and most proxies) provide. Used as one of the two keys on the
 * `record_email_send` rate limit. Returns `null` when no header
 * matches — the RPC treats null as "skip IP check".
 */
function clientIpFromHeaders(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? null;
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
    if (error.code === "user_already_exists" || error.code === "email_exists") {
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
    locale &&
    routing.locales.includes(locale as (typeof routing.locales)[number])
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

type UnlinkIdentityMessageKey =
  | "unconfigured"
  | "guest"
  | "notFound"
  | "lastIdentity"
  | "unlinkFailed";

export type UnlinkIdentityState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; messageKey: UnlinkIdentityMessageKey };

/**
 * Disconnect an OAuth provider (or the email identity) from the
 * signed-in user's account. The form field `identity_id` carries
 * the immutable identity row id we want removed.
 *
 * Safety: Supabase itself blocks removing the LAST identity on a
 * user (returns `single_identity_not_deletable`). We re-check that
 * here too so the UI never even tries.
 */
export async function unlinkIdentityAction(
  _prevState: UnlinkIdentityState,
  formData: FormData,
): Promise<UnlinkIdentityState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const identityId = String(formData.get("identity_id") ?? "").trim();
  if (!identityId) return { status: "error", messageKey: "notFound" };

  const identities = user.identities ?? [];
  if (identities.length <= 1) {
    return { status: "error", messageKey: "lastIdentity" };
  }

  const target = identities.find((row) => row.identity_id === identityId);
  if (!target) return { status: "error", messageKey: "notFound" };

  const { error } = await supabase.auth.unlinkIdentity(target);
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] unlink identity failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    // Supabase surfaces this when the call would leave the user
    // without any way to sign back in. The earlier check should
    // have caught it; this is the belt-and-suspenders branch.
    if (
      error.code === "single_identity_not_deletable" ||
      error.code === "identity_already_exists"
    ) {
      return { status: "error", messageKey: "lastIdentity" };
    }
    return { status: "error", messageKey: "unlinkFailed" };
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
