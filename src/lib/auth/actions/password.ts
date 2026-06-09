"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { resolveSiteOrigin, sanitizeNextPath } from "../redirect-url";
import { isRateLimitError } from "../error-classify";
import { routing } from "@/i18n/routing";
import { credentialSchema, passwordSchema } from "./schemas";

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
