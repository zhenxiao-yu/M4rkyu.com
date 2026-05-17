"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const itemTypeSchema = z.enum([
  "project",
  "gallery",
  "log",
  "game",
  "resource",
  "note",
]);

const toggleInputSchema = z.object({
  itemType: itemTypeSchema,
  itemKey: z.string().min(1).max(200),
});

export type ToggleSaveResult =
  | { ok: true; saved: boolean }
  | { ok: false; reason: "guest" | "unconfigured" | "invalid" | "error" };

/**
 * Toggle save state for `(itemType, itemKey)` as the current user.
 * Returns the new state on success. Guest callers get
 * `{ ok: false, reason: "guest" }` — the UI is expected to open the
 * sign-in sheet in response.
 */
export async function toggleSaveAction(input: {
  itemType: string;
  itemKey: string;
}): Promise<ToggleSaveResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };

  const parsed = toggleInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "guest" };

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("user_saved_items")
    .select("item_key")
    .eq("user_id", user.id)
    .eq("item_type", parsed.data.itemType)
    .eq("item_key", parsed.data.itemKey)
    .maybeSingle<{ item_key: string }>();

  if (existing) {
    const { error } = await supabase
      .from("user_saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", parsed.data.itemType)
      .eq("item_key", parsed.data.itemKey);
    if (error) return { ok: false, reason: "error" };
    revalidatePath("/", "layout");
    return { ok: true, saved: false };
  }

  const { error } = await supabase.from("user_saved_items").insert({
    user_id: user.id,
    item_type: parsed.data.itemType,
    item_key: parsed.data.itemKey,
  });
  if (error) return { ok: false, reason: "error" };
  revalidatePath("/", "layout");
  return { ok: true, saved: true };
}

// Match the slug pattern enforced across `src/content/*` — lowercase
// alphanumerics, dashes, underscores. Locks the migration path to
// shapes that could plausibly resolve against a real piece of content
// in `lookupContent`. Cap of 200 items per import (was 500) keeps the
// upsert payload bounded.
const importedSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9_-]{0,79}$/i, "invalid slug shape");

const importInputSchema = z.object({
  slugs: z.array(importedSlugSchema).max(200),
  itemType: itemTypeSchema.default("gallery"),
});

/**
 * One-shot migration of a localStorage `m4_saved_frames` payload
 * into Supabase. Called by `<LocalSavesMigration />` the first time
 * a signed-in user lands on the site after the auth system rolled out.
 */
export async function importLocalSavesAction(input: {
  slugs: string[];
  itemType?: string;
}): Promise<{ ok: true; imported: number } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };

  const parsed = importInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  if (parsed.data.slugs.length === 0) return { ok: true, imported: 0 };

  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "guest" };

  const supabase = await createSupabaseServerClient();

  // Determine the *true* newly-imported count by diffing against
  // what's already saved. Supabase's `count` on an
  // `ignoreDuplicates` upsert returns rows-considered, not
  // rows-inserted — that would over-report on every retry.
  const { data: existingRows } = await supabase
    .from("user_saved_items")
    .select("item_key")
    .eq("user_id", user.id)
    .eq("item_type", parsed.data.itemType)
    .in("item_key", parsed.data.slugs);
  const existingKeys = new Set(
    (existingRows ?? []).map((row) => (row as { item_key: string }).item_key),
  );
  const newSlugs = parsed.data.slugs.filter((slug) => !existingKeys.has(slug));

  if (newSlugs.length === 0) {
    return { ok: true, imported: 0 };
  }

  const rows = newSlugs.map((slug) => ({
    user_id: user.id,
    item_type: parsed.data.itemType,
    item_key: slug,
  }));

  // Upsert (instead of plain insert) defends against a race where the
  // user double-clicks the migration toast between the diff above and
  // the write below — duplicates from that window silently no-op.
  const { error } = await supabase
    .from("user_saved_items")
    .upsert(rows, {
      onConflict: "user_id,item_type,item_key",
      ignoreDuplicates: true,
    });

  if (error) return { ok: false, reason: "error" };
  revalidatePath("/", "layout");
  return { ok: true, imported: newSlugs.length };
}
