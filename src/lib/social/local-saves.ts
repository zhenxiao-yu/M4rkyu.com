// Legacy localStorage saves — preserved as a one-time migration helper
// for visitors who saved frames before the auth system landed.
//
// The active saves system is now in `src/lib/social/saves.ts` and is
// server-backed (Supabase). This module exists only so the migration
// toast in `src/components/saves/local-saves-migration.tsx` can
// read + clear the old key on first login.

import { readStoredJson, writeStoredJson } from "@/lib/browser/safe-storage";

const STORAGE_KEY = "m4_saved_frames";

export function readLegacyLocalSavedSlugs(): string[] {
  return readStoredJson(STORAGE_KEY, [], isStringList);
}

export function clearLegacyLocalSaves(): void {
  writeStoredJson(STORAGE_KEY, []);
}

export const LEGACY_SAVES_STORAGE_KEY = STORAGE_KEY;

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}
