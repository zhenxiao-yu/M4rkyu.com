"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const profileSchema = z.object({
  display_name: z.string().trim().min(0).max(60),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_-]{3,24}$/u, "usernameFormat")
    .or(z.literal("")),
  bio: z.string().trim().max(280),
  website: z.string().trim().url("websiteInvalid").or(z.literal("")),
  public_profile: z.enum(["true", "false"]),
});

export type ProfileFormState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; messageKey: string };

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }
  const user = await getCurrentUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name") ?? "",
    username: formData.get("username") ?? "",
    bio: formData.get("bio") ?? "",
    website: formData.get("website") ?? "",
    public_profile: formData.get("public_profile") ?? "true",
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "invalid";
    return { status: "error", messageKey: first };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name || null,
      username: parsed.data.username || null,
      bio: parsed.data.bio || null,
      website: parsed.data.website || null,
      public_profile: parsed.data.public_profile === "true",
    })
    .eq("id", user.id);

  if (error) {
    // Postgres returns 23505 on the unique username constraint.
    if ((error as { code?: string }).code === "23505") {
      return { status: "error", messageKey: "usernameTaken" };
    }
    return { status: "error", messageKey: "saveFailed" };
  }
  revalidatePath("/", "layout");
  return { status: "ok" };
}
