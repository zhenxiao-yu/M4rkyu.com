import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeNextPath } from "@/lib/auth/redirect-url";
import { routing } from "@/i18n/routing";

/**
 * OAuth + magic-link callback. Supabase redirects here with a `code`
 * query param after the provider hands back its auth response; we
 * exchange the code for a session cookie and bounce to the original
 * destination (or the locale home).
 *
 * The route lives OUTSIDE `[locale]` so the redirect URL configured
 * in Supabase + Google + GitHub stays stable regardless of which
 * locale the user logged in from. The middleware matcher already
 * excludes `/auth/callback` so the locale-prefix redirect doesn't
 * eat the request.
 */
export async function GET(request: NextRequest) {
  return handleAuthCallback(request);
}

export async function handleAuthCallback(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = classifyEmailOtpType(searchParams.get("type"));
  const rawNext = searchParams.get("next") ?? "/";
  const next = sanitizeNextPath(rawNext, `/${routing.defaultLocale}`);

  if (!isSupabaseConfigured()) {
    // Surfaces a clean error in the rare case someone hits the
    // callback with no project configured. Better than a confusing
    // 500 from the supabase client throw.
    return NextResponse.redirect(
      `${origin}/${routing.defaultLocale}?authError=unconfigured`,
    );
  }

  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      const reason = classifyCallbackError(
        error.code ?? null,
        error.message ?? null,
        null,
      );
      return NextResponse.redirect(
        `${origin}${next}?authError=${encodeURIComponent(reason)}`,
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  if (!code) {
    // Supabase sends `error` + `error_code` in the query string for
    // server-side flows (and duplicates them into the hash fragment
    // for client-side ones). We normalise to one of a small set of
    // toast-friendly keys; raw Supabase codes go through `classify`
    // so future codes default to a generic message instead of
    // leaking machine-y strings into the URL.
    const reason = classifyCallbackError(
      searchParams.get("error_code"),
      searchParams.get("error"),
      searchParams.get("error_description"),
    );
    return NextResponse.redirect(
      `${origin}${next}?authError=${encodeURIComponent(reason)}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${next}?authError=exchangeFailed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

type EmailOtpCallbackType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

function classifyEmailOtpType(type: string | null): EmailOtpCallbackType | null {
  const normalized = (type ?? "").toLowerCase();
  switch (normalized) {
    case "email":
    case "email_change":
    case "magiclink":
    case "recovery":
    case "invite":
    case "signup":
      return normalized;
    default:
      return null;
  }
}

/**
 * Map raw Supabase callback errors onto the stable keys
 * `AuthStatusToast` knows how to translate. Returns `missingCode`
 * when there's no signal at all (the user hit the callback URL
 * directly with nothing attached).
 */
function classifyCallbackError(
  errorCode: string | null,
  error: string | null,
  description: string | null,
): string {
  const code = (errorCode ?? "").toLowerCase();
  const top = (error ?? "").toLowerCase();
  const details = (description ?? "").toLowerCase();
  if (!code && !top) return "missingCode";
  if (code === "otp_expired" || code === "expired_token") return "otpExpired";
  if (code === "over_email_send_rate_limit" || code === "rate_limit_exceeded") {
    return "rateLimited";
  }
  if (details.includes("multiple accounts with the same email address")) {
    return "duplicateIdentity";
  }
  if (top === "access_denied") return "accessDenied";
  if (code === "server_error" || top === "server_error") return "serverError";
  return "generic";
}
