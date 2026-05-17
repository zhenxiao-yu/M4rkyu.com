"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const itemTypeSchema = z.enum(["project", "gallery", "log", "game", "note"]);

const submitSchema = z.object({
  itemType: itemTypeSchema,
  itemKey: z.string().min(1).max(200),
  body: z.string().trim().min(2).max(2000),
});

export type SubmitCommentState =
  | { status: "idle" }
  | { status: "ok"; pending: boolean }
  | { status: "error"; messageKey: string };

/**
 * Create a comment as the current user. Default status is `pending`
 * (the auto_approve_admin_comments trigger promotes admin comments
 * to `approved` server-side).
 */
export async function submitCommentAction(
  _prev: SubmitCommentState,
  formData: FormData,
): Promise<SubmitCommentState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }
  const user = await getCurrentUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const parsed = submitSchema.safeParse({
    itemType: formData.get("itemType"),
    itemKey: formData.get("itemKey"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { status: "error", messageKey: "invalid" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      item_type: parsed.data.itemType,
      item_key: parsed.data.itemKey,
      body: parsed.data.body,
    })
    .select("status")
    .single();

  if (error) {
    // The rate_limit_comments() trigger in
    // supabase/migrations/20260516001000_functions_triggers.sql
    // raises SQLSTATE 'P0001' when a user posts > 5 comments / 60s.
    // Match on the code, not the English message text — the latter
    // would silently break on any locale or wording drift.
    if ((error as { code?: string }).code === "P0001") {
      return { status: "error", messageKey: "rateLimited" };
    }
    return { status: "error", messageKey: "saveFailed" };
  }

  revalidatePath("/", "layout");
  return {
    status: "ok",
    pending: (data as { status: string } | null)?.status !== "approved",
  };
}

/**
 * Soft-update of a user's own pending/rejected/hidden comment.
 * Approved comments are locked (the RLS policy enforces this).
 */
export async function editOwnCommentAction(input: {
  id: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "guest" };

  const body = z.string().trim().min(2).max(2000).safeParse(input.body);
  if (!body.success) return { ok: false, reason: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("comments")
    .update({ body: body.data, is_edited: true })
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) return { ok: false, reason: "saveFailed" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteOwnCommentAction(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "guest" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, reason: "saveFailed" };
  revalidatePath("/", "layout");
  return { ok: true };
}
