import { env } from "@/lib/env";

/**
 * `true` when both Supabase public env vars are present. Every entry
 * point in `src/lib/supabase/*` checks this and short-circuits when
 * the project is unconfigured — that's how the app stays buildable
 * (and the marketing surfaces stay reachable) before the author has
 * created a Supabase project.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Throw a clear error from server-side helpers when Supabase is
 * unconfigured. UI callers should first check `isSupabaseConfigured()`
 * and render a graceful "auth unavailable" state — but server code
 * that has already decided it needs a client should explode loudly
 * rather than return a misleading null.
 */
export function getSupabaseConfigOrThrow(): {
  url: string;
  anonKey: string;
} {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env (see supabase/README.md).",
    );
  }
  return { url, anonKey };
}
