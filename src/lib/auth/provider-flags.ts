import { env } from "@/lib/env";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type ProviderFlag =
  | "NEXT_PUBLIC_AUTH_GOOGLE_ENABLED"
  | "NEXT_PUBLIC_AUTH_GITHUB_ENABLED"
  | "NEXT_PUBLIC_AUTH_DISCORD_ENABLED";

function providerEnabled(flag: ProviderFlag): boolean {
  if (!isSupabaseConfigured()) return false;
  return env[flag] !== "false";
}

export function authProviderFlags() {
  return {
    google: providerEnabled("NEXT_PUBLIC_AUTH_GOOGLE_ENABLED"),
    github: providerEnabled("NEXT_PUBLIC_AUTH_GITHUB_ENABLED"),
    discord: providerEnabled("NEXT_PUBLIC_AUTH_DISCORD_ENABLED"),
  };
}
