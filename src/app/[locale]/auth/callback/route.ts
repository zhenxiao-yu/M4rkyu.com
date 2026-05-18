import type { NextRequest } from "next/server";
import { handleAuthCallback } from "@/app/auth/callback/route";

/**
 * Locale-prefixed alias for the canonical /auth/callback handler.
 *
 * Supabase emails carry the redirect URL that was passed via
 * `emailRedirectTo` at send time. Old emails (and any configuration
 * that stamps a locale prefix into the redirect URL list in the
 * Supabase dashboard) can land users at `/<locale>/auth/callback`
 * with the auth code or error attached. Re-exporting the handler
 * here keeps both URL shapes working without duplicating logic.
 *
 * Deleted as "dead code" in the 8f48f2b hardening pass and restored
 * after a real user-reported 404. The previous review missed that
 * older emails in users' inboxes already point at the locale form;
 * removing this surface broke their sign-in.
 */
export function GET(request: NextRequest) {
  return handleAuthCallback(request);
}
