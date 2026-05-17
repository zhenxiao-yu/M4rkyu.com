import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfigOrThrow, isSupabaseConfigured } from "./config";

/**
 * Refresh the Supabase session cookie for an incoming request and
 * return a NextResponse with the updated `Set-Cookie` headers. The
 * caller (root `middleware.ts`) is expected to:
 *
 *   1. Call this first to mint a base response.
 *   2. Forward cookie mutations onto whatever response the
 *      downstream middleware (e.g. next-intl) returns.
 *
 * This is the official `@supabase/ssr` pattern for Next.js App
 * Router middleware composition.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: { id: string } | null;
}> {
  // No-op when unconfigured. The request continues normally; sign-in
  // UI is hidden by `isSupabaseConfigured()` upstream.
  if (!isSupabaseConfigured()) {
    return { response: NextResponse.next({ request }), user: null };
  }

  const { url, anonKey } = getSupabaseConfigOrThrow();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Forward cookie writes onto both the request (so downstream
        // middlewares see them) and the outgoing response (so the
        // browser persists them).
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
      },
    },
  });

  // CRITICAL: `getUser` validates the JWT against Supabase and
  // triggers the refresh-token rotation if needed. Reading the user
  // is the only way to keep the session alive across requests.
  // Do NOT replace this with a `getSession()` call — that one just
  // reads the cookie without validating it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user: user ? { id: user.id } : null };
}
