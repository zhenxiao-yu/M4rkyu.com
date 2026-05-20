import "server-only";

import { cache } from "react";
import { profile } from "@/content/profile";
import type { Profile } from "@/content/schemas";
import { getDbProfile } from "./db";

// Single source of truth for the site profile. Prefers the DB-backed
// singleton row, falling back to the static src/content/profile.ts
// when the row is missing/malformed or Supabase is unconfigured.
// Wrapped in React cache() so a render that reads the profile from
// several places resolves it once.
export const getProfileSource = cache(async (): Promise<Profile> => {
  return (await getDbProfile()) ?? profile;
});
