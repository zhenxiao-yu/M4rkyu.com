"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const moderateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "hidden", "pending"]),
});

export async function moderateCommentAction(input: {
  id: string;
  status: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { ok: false, reason: "forbidden" };

  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("comments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, reason: "saveFailed" };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteCommentAsAdminAction(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unconfigured" };
  const user = await getCurrentUser();
  if (!user?.isAdmin) return { ok: false, reason: "forbidden" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) return { ok: false, reason: "saveFailed" };
  revalidatePath("/", "layout");
  return { ok: true };
}
