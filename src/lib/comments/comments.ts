import "server-only";

import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type {
  CommentItemType,
  CommentRow,
  ProfileRow,
} from "@/lib/supabase/types";

/** Comment joined with a slim author projection for rendering. */
export interface CommentWithAuthor extends CommentRow {
  author: Pick<ProfileRow, "id" | "display_name" | "username" | "avatar_url"> | null;
}

/**
 * Public list for a thread. Returns approved comments to everyone;
 * authors and admins additionally see their own pending/rejected/hidden
 * via the RLS policy. The caller doesn't have to filter — RLS does.
 */
export const listCommentsForItem = cache(
  async (
    itemType: CommentItemType,
    itemKey: string,
  ): Promise<CommentWithAuthor[]> => {
    if (!isSupabaseConfigured()) return [];

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, user_id, parent_id, item_type, item_key, body, status, is_edited, created_at, updated_at, author:profiles(id, display_name, username, avatar_url)",
      )
      .eq("item_type", itemType)
      .eq("item_key", itemKey)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as unknown as CommentWithAuthor[];
  },
);

/** All comments authored by the current user, newest first. */
export const listOwnComments = cache(async (): Promise<CommentRow[]> => {
  if (!isSupabaseConfigured()) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as CommentRow[];
});

/** All pending comments (admin moderation queue). */
export const listPendingComments = cache(
  async (): Promise<CommentWithAuthor[]> => {
    if (!isSupabaseConfigured()) return [];
    const user = await getCurrentUser();
    if (!user?.isAdmin) return [];

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, user_id, parent_id, item_type, item_key, body, status, is_edited, created_at, updated_at, author:profiles(id, display_name, username, avatar_url)",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as unknown as CommentWithAuthor[];
  },
);
