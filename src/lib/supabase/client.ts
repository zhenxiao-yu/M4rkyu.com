"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfigOrThrow } from "./config";

/**
 * Singleton browser client. Safe to call from any client component;
 * `@supabase/ssr` returns the same instance across calls in the
 * browser. Cookies are shared with the server runtime via the
 * project's middleware.
 *
 * Throws when Supabase env vars are missing. Callers that may render
 * before login is configured should guard with `isSupabaseConfigured()`.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseConfigOrThrow();
  return createBrowserClient(url, anonKey);
}
