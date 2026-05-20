import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { UserPreferencesRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export interface NotificationStateResponse {
  signedIn: boolean;
  lastSeenAt: string | null;
  browserNotifications: boolean;
  emailNotifications: boolean;
}

export async function GET(): Promise<NextResponse<NotificationStateResponse>> {
  const fallback = emptyState(false);
  if (!isSupabaseConfigured()) return NextResponse.json(fallback);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(fallback);

  const { data } = await supabase
    .from("user_preferences")
    .select("notification_last_seen_at,browser_notifications,email_notifications")
    .eq("user_id", user.id)
    .maybeSingle<
      Pick<
        UserPreferencesRow,
        "notification_last_seen_at" | "browser_notifications" | "email_notifications"
      >
    >();

  return NextResponse.json({
    signedIn: true,
    lastSeenAt: data?.notification_last_seen_at ?? null,
    browserNotifications: data?.browser_notifications ?? false,
    emailNotifications: data?.email_notifications ?? false,
  });
}

export async function PATCH(
  request: Request,
): Promise<NextResponse<NotificationStateResponse>> {
  const fallback = emptyState(false);
  if (!isSupabaseConfigured()) return NextResponse.json(fallback);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(fallback, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    lastSeenAt?: unknown;
    browserNotifications?: unknown;
    emailNotifications?: unknown;
  };

  const patch: Partial<UserPreferencesRow> & { user_id: string } = {
    user_id: user.id,
  };
  if (typeof body.lastSeenAt === "string") {
    patch.notification_last_seen_at = body.lastSeenAt;
  }
  if (typeof body.browserNotifications === "boolean") {
    patch.browser_notifications = body.browserNotifications;
  }
  if (typeof body.emailNotifications === "boolean") {
    patch.email_notifications = body.emailNotifications;
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(patch, { onConflict: "user_id" })
    .select("notification_last_seen_at,browser_notifications,email_notifications")
    .single<
      Pick<
        UserPreferencesRow,
        "notification_last_seen_at" | "browser_notifications" | "email_notifications"
      >
    >();

  if (error) {
    return NextResponse.json(emptyState(true), { status: 500 });
  }

  return NextResponse.json({
    signedIn: true,
    lastSeenAt: data.notification_last_seen_at,
    browserNotifications: data.browser_notifications,
    emailNotifications: data.email_notifications,
  });
}

function emptyState(signedIn: boolean): NotificationStateResponse {
  return {
    signedIn,
    lastSeenAt: null,
    browserNotifications: false,
    emailNotifications: false,
  };
}
