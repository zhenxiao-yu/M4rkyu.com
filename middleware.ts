import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

// Composes the two middlewares the site needs:
//
//   1. Supabase session refresh — validates the JWT cookie and
//      rotates the refresh token. Required for SSR auth to work.
//   2. next-intl locale negotiation — owns `/<locale>/...` routing
//      and the locale-prefix redirect on bare paths.
//
// The order matters: Supabase mutates cookies first, then we let
// next-intl produce the final response (redirect / rewrite / pass).
// Cookie mutations from Supabase are copied onto whatever response
// next-intl returns so the browser persists the refreshed session.

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { response: supabaseResponse } = await updateSupabaseSession(request);

  const intlResponse = intlMiddleware(request);

  // If next-intl wants to redirect/rewrite, propagate the Supabase
  // cookies onto its response so the session refresh isn't dropped.
  if (intlResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, {
        domain: cookie.domain,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        maxAge: cookie.maxAge,
        path: cookie.path,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
      });
    });
    return intlResponse;
  }

  return supabaseResponse;
}

// Skip Next internals, image optimizer output, static files, and
// the auth callback route (the callback handles its own cookie
// session creation). The matcher mirrors the next-intl default
// plus a few project-specific carve-outs.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth/callback|favicon.ico|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf|otf|mp3|mp4)).*)",
  ],
};

// Re-export so unit tests / debugging hooks can introspect the
// composition. Not load-bearing for the runtime.
export { NextResponse };
