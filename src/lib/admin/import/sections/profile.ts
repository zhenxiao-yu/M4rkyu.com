import "server-only";

import { profile } from "@/content/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ImportReport } from "../types";

// site_profile is a singleton (id = true). Seed it from static content
// only when the row is absent — never overwrite a profile the owner has
// already edited in the DB.
export async function importProfile(dryRun: boolean): Promise<ImportReport> {
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("site_profile")
    .select("id")
    .eq("id", true)
    .maybeSingle();
  const present = Boolean(existing);
  if (!dryRun && !present) {
    const { error } = await supabase
      .from("site_profile")
      .insert({ id: true, data: profile });
    if (error) throw new Error(error.message);
  }
  return {
    section: "profile",
    totalStatic: 1,
    inserted: present ? 0 : dryRun ? 0 : 1,
    skipped: present ? 1 : 0,
    skippedSlugs: present ? ["profile"] : [],
  };
}
