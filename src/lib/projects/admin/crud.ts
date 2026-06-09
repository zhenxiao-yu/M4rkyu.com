"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
  zodToActionState,
} from "@/lib/admin/action-state";
import { deleteContentImage } from "@/lib/content-images/storage";
import {
  DATA_COLUMNS,
  parseForm,
  pickField,
  projectFormSchema,
  revalidateProjects,
  toRow,
  uploadCoverIfPresent,
} from "./_shared";

// Admin server actions for projects. requireAdmin gate, Zod-validated
// input, RLS as the underlying enforcement layer. create/update return
// an AdminActionState so the form shows inline feedback instead of
// throwing. Note: projects use `content_status` for public visibility
// (`status` is the lifecycle field).

export async function createProjectAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  let parsed: z.infer<typeof projectFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const upload = await uploadCoverIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("projects")
    .insert({ ...toRow(parsed), cover_path: upload.path });
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  revalidateProjects(parsed.slug);
  redirect(`/admin/projects/${parsed.slug}`);
}

export async function updateProjectAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) return adminError("Missing record id.");
  let parsed: z.infer<typeof projectFormSchema>;
  try {
    parsed = parseForm(formData);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }
  const supabase = await createSupabaseServerClient();
  const upload = await uploadCoverIfPresent(formData, parsed.slug);
  if (upload.error) {
    return adminError(dbErrorToMessage("upload failed"), { image: " " });
  }

  const patch = upload.path
    ? { ...toRow(parsed), cover_path: upload.path }
    : toRow(parsed);

  // Grab the old path first so a successful re-upload can clean up.
  let oldPath: string | null = null;
  if (upload.path) {
    const { data } = await supabase
      .from("projects")
      .select("cover_path")
      .eq("id", id)
      .maybeSingle();
    oldPath = (data?.cover_path as string | null | undefined) ?? null;
  }

  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  if (error) {
    if (upload.path) await deleteContentImage(upload.path);
    return adminError(dbErrorToMessage(error.message), { slug: " " });
  }

  if (upload.path && oldPath && oldPath !== upload.path) {
    await deleteContentImage(oldPath);
  }

  revalidateProjects(parsed.slug);
  return adminSuccess();
}

export async function deleteProjectAction(formData: FormData) {
  await requireAdmin();
  const id = pickField(formData, "id");
  if (!id) throw new Error("missing id");

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("projects")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle();
  const coverPath = row?.cover_path as string | null | undefined;

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (coverPath) await deleteContentImage(coverPath);

  revalidateProjects();
  redirect("/admin/projects");
}

export async function duplicateProjectAction(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select(DATA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const source = data as Record<string, unknown> & { slug: string; title: string };

  // Find a free `<slug>-copy[-n]` slug.
  let slug = `${source.slug}-copy`.slice(0, 80);
  for (let n = 2; ; n += 1) {
    const { data: clash } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${source.slug}-copy-${n}`.slice(0, 80);
    if (n > 50) return;
  }

  const { error } = await supabase
    .from("projects")
    .insert({ ...source, slug, title: `${source.title} (copy)`, content_status: "draft" });
  if (error) return;
  revalidateProjects();
  redirect(`/admin/projects/${slug}`);
}
