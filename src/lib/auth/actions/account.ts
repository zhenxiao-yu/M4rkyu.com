"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { routing } from "@/i18n/routing";

/**
 * Sign out the current session. Redirects to the locale home so the
 * resulting page tree refreshes its auth-dependent server data.
 *
 * Pass `scope: "global"` to revoke every active session for this user
 * (across all devices). Default `"local"` only kills the session
 * bound to the current cookie.
 */
export async function signOutAction(
  locale?: string,
  scope: "local" | "global" = "local",
): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope });
  }
  const target =
    locale &&
    routing.locales.includes(locale as (typeof routing.locales)[number])
      ? `/${locale}`
      : `/${routing.defaultLocale}`;
  revalidatePath("/", "layout");
  redirect(target);
}

type UnlinkIdentityMessageKey =
  | "unconfigured"
  | "guest"
  | "notFound"
  | "lastIdentity"
  | "unlinkFailed";

export type UnlinkIdentityState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; messageKey: UnlinkIdentityMessageKey };

/**
 * Disconnect an OAuth provider (or the email identity) from the
 * signed-in user's account. The form field `identity_id` carries
 * the immutable identity row id we want removed.
 *
 * Safety: Supabase itself blocks removing the LAST identity on a
 * user (returns `single_identity_not_deletable`). We re-check that
 * here too so the UI never even tries.
 */
export async function unlinkIdentityAction(
  _prevState: UnlinkIdentityState,
  formData: FormData,
): Promise<UnlinkIdentityState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const identityId = String(formData.get("identity_id") ?? "").trim();
  if (!identityId) return { status: "error", messageKey: "notFound" };

  const identities = user.identities ?? [];
  if (identities.length <= 1) {
    return { status: "error", messageKey: "lastIdentity" };
  }

  const target = identities.find((row) => row.identity_id === identityId);
  if (!target) return { status: "error", messageKey: "notFound" };

  const { error } = await supabase.auth.unlinkIdentity(target);
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] unlink identity failed", {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    }
    // Supabase surfaces this when the call would leave the user
    // without any way to sign back in. The earlier check should
    // have caught it; this is the belt-and-suspenders branch.
    if (
      error.code === "single_identity_not_deletable" ||
      error.code === "identity_already_exists"
    ) {
      return { status: "error", messageKey: "lastIdentity" };
    }
    return { status: "error", messageKey: "unlinkFailed" };
  }

  revalidatePath("/", "layout");
  return { status: "ok" };
}

type DeleteAccountMessageKey =
  | "unconfigured"
  | "guest"
  | "confirmationMismatch"
  | "deleteFailed";

export type DeleteAccountState =
  | { status: "idle" }
  | { status: "error"; messageKey: DeleteAccountMessageKey };

/**
 * Permanently delete the signed-in user's account.
 *
 * The user types their email into the confirmation field; we compare
 * it (case-insensitive) against the session email before invoking
 * the `public.delete_my_account()` RPC. The RPC itself is gated by
 * `auth.uid()` so even if a malicious client skipped this UI check,
 * RLS / function permissions stop them from deleting someone else.
 *
 * On success: sign out + redirect to the locale home.
 */
export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", messageKey: "unconfigured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", messageKey: "guest" };

  const typed = String(formData.get("confirmation") ?? "")
    .trim()
    .toLowerCase();
  const sessionEmail = (user.email ?? "").trim().toLowerCase();
  if (!sessionEmail || typed !== sessionEmail) {
    return { status: "error", messageKey: "confirmationMismatch" };
  }

  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[auth] delete account failed", {
        message: error.message,
        code: error.code,
      });
    }
    return { status: "error", messageKey: "deleteFailed" };
  }

  // Account is gone — clear the cookie session and bounce home.
  await supabase.auth.signOut();
  const rawLocale = String(formData.get("locale") ?? routing.defaultLocale);
  const target = routing.locales.includes(
    rawLocale as (typeof routing.locales)[number],
  )
    ? `/${rawLocale}`
    : `/${routing.defaultLocale}`;
  revalidatePath("/", "layout");
  redirect(`${target}?accountDeleted=1`);
}
