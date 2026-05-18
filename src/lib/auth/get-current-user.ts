import "server-only";

import { cache } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ProfileRow } from "@/lib/supabase/types";

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: ProfileRow | null;
  isAdmin: boolean;
  /**
   * The signed-in user's linked OAuth + email identities. Powers the
   * "Connected accounts" panel in settings: once you've linked
   * Google + GitHub + email to the same account, any of them signs
   * you in. An empty array means the upstream call was unavailable
   * (e.g. legacy session); the panel renders a graceful empty state.
   */
  identities: UserIdentity[];
}

/**
 * Resolve the signed-in user + their profile row, or `null` for
 * guests. Memoized per render via React.cache so multiple components
 * in the same tree don't each pay an auth round-trip.
 *
 * Returns null (instead of throwing) when Supabase is unconfigured —
 * that keeps preview deploys without env vars from 500ing.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    isAdmin: profile?.role === "admin",
    identities: user.identities ?? [],
  };
});
