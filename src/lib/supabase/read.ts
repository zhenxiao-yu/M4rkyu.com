import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { isSupabaseConfigured } from "./config";

/**
 * Cookieless, anon-key Supabase client for PUBLIC reads only.
 *
 * Unlike `createSupabaseServerClient`, this never touches `cookies()`,
 * so a page/route that reads public content through it is NOT forced
 * into dynamic rendering — it can be statically generated / ISR-cached
 * and served from the CDN. RLS still applies (anon role), so it only
 * ever sees what the public SELECT policies expose.
 *
 * Use it for public list/detail reads (the `getXSource` layer). Admin
 * reads that must see drafts, and anything that needs the signed-in
 * user, must keep using `createSupabaseServerClient` (cookie-bound).
 *
 * Returns null when Supabase isn't configured so callers fall back to
 * the static `src/content/*` arrays, exactly like the cookie-bound path.
 */
let cached: SupabaseClient | null = null;

export function createSupabaseReadClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
