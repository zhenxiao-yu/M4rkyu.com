import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sanitizeNextPath } from "@/lib/auth/redirect-url";
import { routing } from "@/i18n/routing";

// OAuth + magic-link callback. Lives outside [locale] so Supabase/Google/GitHub redirect URLs stay stable across locales; middleware matcher excludes this path.
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
    // Clean toast instead of a 500 when the project isn't configured.
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
    // Normalize Supabase error/error_code into toast-friendly keys; unknown codes fall through to generic.
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

// Map Supabase callback errors → stable AuthStatusToast keys; `missingCode` when the URL carries nothing.
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
