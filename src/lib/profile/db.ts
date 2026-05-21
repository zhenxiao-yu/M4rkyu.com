import "server-only";

import { cache } from "react";
import { createSupabaseReadClient } from "@/lib/supabase/read";
import { profileSchema, type Profile } from "@/content/schemas";

// DB-backed profile read. The site profile is a singleton row in
// `site_profile` (id=true) holding the whole Profile as one JSONB
// blob. Wrapped in React cache() so multiple callers per render hit
// Supabase once. Returns null — never throws — so callers can fall
// back cleanly to the static src/content/profile.ts when the row is
// missing, malformed, or Supabase is unconfigured.
//
// `createSupabaseServerClient` reads request cookies, which throws
// when Next is enumerating `generateStaticParams` / `sitemap` at
// build time (no request context). We try/catch around the
// cookies-using setup and fall back to null — `getProfileSource`
// then returns the static `profile` object, which is the intended
// build-time behaviour until the table is the source of truth.
export const getDbProfile = cache(async (): Promise<Profile | null> => {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("site_profile")
      .select("data")
      .eq("id", true)
      .maybeSingle();
    if (error || !data) return null;

    // The JSONB blob is untrusted (hand-edited via the admin form).
    // safeParse so a malformed row degrades to the static fallback
    // instead of crashing the about page / footer / home sections.
    const parsed = profileSchema.safeParse((data as { data: unknown }).data);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
});
