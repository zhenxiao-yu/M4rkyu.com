"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
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
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  // Normalize sort_order to the new positions; only write what changed.
  await Promise.all(
    rows
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.sort_order !== position)
      .map(({ row, position }) =>
        supabase.from("projects").update({ sort_order: position }).eq("id", row.id),
      ),
  );
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
