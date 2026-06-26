"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
} from "@/lib/admin/action-state";
import { importProjects } from "./sections/projects";
import { importGames } from "./sections/games";
import { importMedia, importResources, importNotes, importShop } from "./sections/simple";
import { importGallery } from "./sections/gallery";
import { importProfile } from "./sections/profile";
import type { ImportReport } from "./types";

export async function runAllImports(dryRun: boolean): Promise<ImportReport[]> {
  const [projects, gamesR, media, resources, notesR, shop, gallery, profileR] =
    await Promise.all([
      importProjects(dryRun),
      importGames(dryRun),
      importMedia(dryRun),
      importResources(dryRun),
      importNotes(dryRun),
      importShop(dryRun),
      importGallery(dryRun),
      importProfile(dryRun),
    ]);
  return [projects, gamesR, media, resources, notesR, shop, ...gallery, profileR];
}

export async function importAllAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const dryRun = formData.get("dryRun") === "true";
  let reports: ImportReport[];
  try {
    reports = await runAllImports(dryRun);
  } catch (error) {
    return adminError(error instanceof Error ? error.message : "Import failed.");
  }

  const inserted = reports.reduce((n, r) => n + r.inserted, 0);
  const skipped = reports.reduce((n, r) => n + r.skipped, 0);

  if (!dryRun) {
    for (const path of [
      "/work",
      "/games",
      "/media",
      "/resources",
      "/notes",
      "/shop",
      "/archive",
      "/about",
    ]) {
      revalidatePath(`/(.*)${path}`, "page");
    }
    revalidatePath("/(.*)/admin", "page");
  }

  return adminSuccess(
    dryRun
      ? `Dry run: ${inserted} item(s) would import, ${skipped} already present.`
      : `Imported ${inserted} item(s); ${skipped} already present.`,
  );
}
