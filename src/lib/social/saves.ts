import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { SavedItemRow, SavedItemType } from "@/lib/supabase/types";

/**
 * Server-side read helpers for the authenticated saves system.
 *
 * These replace the localStorage-backed module that lived here in
 * the cookie-anonymous era (see docs/GALLERY_SOCIAL_SPEC.md for the
 * superseded design). The legacy localStorage payload is preserved
 * by `src/lib/social/local-saves.ts` and is migrated into Supabase
 * on first login via `<LocalSavesMigration />`.
 *
 * Mutations live in `src/lib/social/saves-actions.ts` (server
 * actions). UI consumers should:
 *   1. Read initial saved state via `isItemSaved` / `getSavedItems`
 *      from a Server Component.
 *   2. Pass it as `initialSaved` to the client `SaveButton`.
 *   3. Let the button call the server action on click; it returns
 *      the new state for optimistic UI.
 */

/** Has the currently signed-in user saved this `(item_type, item_key)`? */
export const isItemSaved = cache(
  async (itemType: SavedItemType, itemKey: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false;
    const user = await getCurrentUser();
    if (!user) return false;

    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("user_saved_items")
      .select("item_key")
      .eq("user_id", user.id)
      .eq("item_type", itemType)
      .eq("item_key", itemKey)
      .maybeSingle<{ item_key: string }>();

    return Boolean(data);
  },
);

/** All saved items for the signed-in user, newest first. */
export const getSavedItems = cache(async (): Promise<SavedItemRow[]> => {
  if (!isSupabaseConfigured()) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_saved_items")
    .select("*")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error || !data) return [];
  return data as SavedItemRow[];
});

/** Saved keys for a specific item_type. Convenience wrapper. */
export async function getSavedKeysOfType(
  itemType: SavedItemType,
): Promise<string[]> {
  const items = await getSavedItems();
  return items.filter((item) => item.item_type === itemType).map((item) => item.item_key);
}
