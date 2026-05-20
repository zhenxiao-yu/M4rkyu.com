"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { profileSchema } from "@/content/schemas";
import {
  type AdminActionState,
  adminError,
  adminSuccess,
  dbErrorToMessage,
  zodToActionState,
} from "@/lib/admin/action-state";

// Admin server action for the site profile singleton. Same posture
// as the projects admin: requireAdmin gate, Zod-validated input, RLS
// as the underlying enforcement layer. The whole Profile is stored
// as one JSONB blob in the `site_profile` row (id=true). Scalars +
// socials come from individual inputs; the complex nested arrays are
// authored as validated JSON textareas, so the form never drifts
// from the schema shape.

function pickField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Parse a JSON textarea field. Throws a readable error pointing at
// the offending field so the admin sees which textarea to fix.
function parseJsonField(formData: FormData, key: string, label: string): unknown {
  const raw = pickField(formData, key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in ${label}`);
  }
}

// Assemble the socials object from individual URL inputs, dropping
// empty strings so partial() validation (and the footer renderers)
// only ever see populated handles.
function buildSocials(formData: FormData): Record<string, string> {
  const keys: [field: string, key: string][] = [
    ["socialGithub", "github"],
    ["socialDevto", "devto"],
    ["socialLinkedin", "linkedin"],
    ["socialBluesky", "bluesky"],
    ["socialTwitter", "twitter"],
    ["socialInstagram", "instagram"],
    ["socialMastodon", "mastodon"],
    ["socialFacebook", "facebook"],
    ["socialYoutube", "youtube"],
  ];
  const socials: Record<string, string> = {};
  for (const [field, key] of keys) {
    const value = pickField(formData, field);
    if (value) socials[key] = value;
  }
  return socials;
}

export async function updateProfileAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  let assembled: Record<string, unknown>;
  try {
    assembled = {
      name: pickField(formData, "name"),
      title: pickField(formData, "title"),
      location: pickField(formData, "location"),
      email: pickField(formData, "email"),
      intro: pickField(formData, "intro"),
      githubHandle: pickField(formData, "githubHandle") || undefined,
      resumeUrl: pickField(formData, "resumeUrl") || undefined,
      socials: buildSocials(formData),
      timeline: parseJsonField(formData, "timelineJson", "Timeline"),
      values: parseJsonField(formData, "valuesJson", "Values"),
      skills: parseJsonField(formData, "skillsJson", "Skills"),
      cities: parseJsonField(formData, "citiesJson", "Cities"),
      currently: parseJsonField(formData, "currentlyJson", "Currently"),
      portraits: parseJsonField(formData, "portraitsJson", "Portraits"),
    };
  } catch (error) {
    return adminError(error instanceof Error ? error.message : "Invalid JSON input.");
  }

  let parsed;
  try {
    parsed = profileSchema.parse(assembled);
  } catch (error) {
    if (error instanceof z.ZodError) return zodToActionState(error);
    throw error;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("site_profile")
    .upsert({ id: true, data: parsed }, { onConflict: "id" });
  if (error) return adminError(dbErrorToMessage(error.message));

  // Profile feeds the about page, the footer (rendered in the root
  // layout), and home sections — revalidate the whole tree plus the
  // about route so all locales pick up the change.
  revalidatePath("/", "layout");
  revalidatePath("/(.*)/about", "page");
  return adminSuccess();
}
