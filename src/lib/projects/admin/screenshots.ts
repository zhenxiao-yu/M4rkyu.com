"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  uploadContentImage,
  deleteContentImage,
} from "@/lib/content-images/storage";
import { intOrNull, pickField, revalidateProjects } from "./_shared";

// Screenshots (project_screenshots + content-images bucket). The manager
// on the edit page posts these as plain form actions; each revalidates so
// the server-rendered list refreshes. Files land in the same content-images
// bucket as covers, slug-prefixed.

export async function addProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const projectId = pickField(formData, "projectId");
  const slug = pickField(formData, "slug") || "project";
  if (!projectId) return;
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return;

  const upload = await uploadContentImage(file, `projects/${slug}/shot`);
  if (!upload) return;

  const supabase = await createSupabaseServerClient();
  // Append at the end of the current order.
  const { count } = await supabase
    .from("project_screenshots")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("project_screenshots").insert({
    project_id: projectId,
    path: upload.path,
    alt: pickField(formData, "alt"),
    label: pickField(formData, "label"),
    caption: pickField(formData, "caption"),
    width: intOrNull(pickField(formData, "width")),
    height: intOrNull(pickField(formData, "height")),
    sort_order: count ?? 0,
  });
  if (error) {
    await deleteContentImage(upload.path);
    return;
  }
  revalidateProjects(slug);
}

export async function updateProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("project_screenshots")
    .update({
      alt: pickField(formData, "alt"),
      label: pickField(formData, "label"),
      caption: pickField(formData, "caption"),
    })
    .eq("id", id);
  revalidateProjects(slug || undefined);
}

export async function deleteProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_screenshots")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  const path = (data?.path as string | null | undefined) ?? null;
  const { error } = await supabase.from("project_screenshots").delete().eq("id", id);
  if (error) return;
  if (path) await deleteContentImage(path);
  revalidateProjects(slug || undefined);
}

export async function reorderProjectScreenshotAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  const slug = pickField(formData, "slug");
  const direction = pickField(formData, "direction") === "up" ? "up" : "down";
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("project_screenshots")
    .select("id, project_id, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const row = data as { id: string; project_id: string; sort_order: number };
  const { data: siblings } = await supabase
    .from("project_screenshots")
    .select("id, sort_order")
    .eq("project_id", row.project_id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = (siblings ?? []) as { id: string; sort_order: number }[];
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= rows.length) return;
  [rows[index], rows[target]] = [rows[target], rows[index]];
  await Promise.all(
    rows
      .map((r, position) => ({ r, position }))
      .filter(({ r, position }) => r.sort_order !== position)
      .map(({ r, position }) =>
        supabase
          .from("project_screenshots")
          .update({ sort_order: position })
          .eq("id", r.id),
      ),
  );
  revalidateProjects(slug || undefined);
}
