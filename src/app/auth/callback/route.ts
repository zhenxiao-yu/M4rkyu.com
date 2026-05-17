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
  const authError = searchParams.get("error_code") ?? searchParams.get("error");
  const code = searchParams.get("code");
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

  if (!code) {
    const reason = authError ?? "missingCode";
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
