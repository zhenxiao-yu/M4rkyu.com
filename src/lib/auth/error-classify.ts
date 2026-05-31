// Pure Supabase-error → outcome classifiers, extracted from actions.ts so
// they can be unit-tested directly and to slim the server-action module.
// No imports, no side effects — safe in any runtime.

export interface AuthErrorLike {
  code?: string | null;
  status?: number | null;
  message?: string | null;
}

export type OtpErrorKey = "otpExpired" | "rateLimited" | "otpFailed";

/** True when a Supabase error represents a rate-limit / throttle response. */
export function isRateLimitError(err: AuthErrorLike): boolean {
  if (err.status === 429) return true;
  const code = err.code ?? "";
  if (code === "over_email_send_rate_limit" || code === "rate_limit_exceeded") {
    return true;
  }
  return false;
}

// Supabase surfaces several distinct error codes for OTP verification.
// We translate them into i18n keys the form already renders. Anything
// we don't recognise falls back to a generic `otpFailed`.
export function classifyOtpError(err: AuthErrorLike): OtpErrorKey {
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

/**
 * True when an admin `generateLink` error means the user row doesn't exist
 * yet (so the caller should create it and retry). Magic link is the
 * user-creation path for password-less accounts.
 */
export function isUserNotFoundError(err: AuthErrorLike): boolean {
  const code = err.code ?? "";
  if (code === "user_not_found") return true;
  if (err.status === 404) return true;
  const message = (err.message ?? "").toLowerCase();
  return message.includes("user not found") || message.includes("no user");
}

/**
 * Best-effort client IP from the proxy headers Vercel (and most proxies)
 * provide. Used as one of the two keys on the `record_email_send` rate
 * limit. Returns `null` when no header matches — the RPC treats null as
 * "skip IP check".
 */
export function clientIpFromHeaders(h: Headers): string | null {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? h.get("cf-connecting-ip") ?? null;
}
