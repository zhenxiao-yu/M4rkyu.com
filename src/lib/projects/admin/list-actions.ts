"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { reorderRow } from "@/lib/admin/reorder";
import { CONTENT_STATUS, revalidateProjects } from "./_shared";

// Lightweight list-UI server actions: inline status toggles, manual
// reordering, and bulk operations across the admin projects table.

export async function setProjectStatusAction(id: string, status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("projects").update({ content_status: parsed.data }).eq("id", id);
  revalidateProjects();
}

export async function reorderProjectAction(id: string, direction: "up" | "down") {
  await requireAdmin();
  await reorderRow("projects", id, direction);
  revalidateProjects();
}

export async function bulkSetProjectStatusAction(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CONTENT_STATUS.safeParse(status);
  if (!parsed.success || ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("projects")
    .update({ content_status: parsed.data })
    .in("id", ids);
  revalidateProjects();
}

export async function bulkDeleteProjectsAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("projects").delete().in("id", ids);
  revalidateProjects();
}
