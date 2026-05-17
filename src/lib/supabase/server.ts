import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfigOrThrow } from "./config";

/**
 * Per-request server client. Reads + writes cookies through Next's
 * cookies() API so session refresh flows through the same store
 * the middleware updates.
 *
 * Server Components can only READ cookies, not set them; the
 * `setAll` handler swallows the resulting error so Supabase's
 * internal refresh logic still works inside a page render. Session
 * cookies actually rotate in the middleware, which is the correct
 * place for that side effect.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseConfigOrThrow();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Server Components can't mutate cookies. The middleware
          // is responsible for actually persisting session refresh
          // cookies on the response — this catch is intentional.
        }
      },
    },
  });
}
