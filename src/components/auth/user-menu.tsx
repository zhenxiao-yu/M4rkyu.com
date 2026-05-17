import { getTranslations } from "next-intl/server";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SignInSheet } from "./sign-in-sheet";
import type { Locale } from "@/i18n/routing";

/**
 * Server component. Renders either:
 *  - the SignInSheet trigger (guest), or
 *  - a link to /account with the user's display name + a small avatar
 *    (signed-in).
 *
 * Hides itself entirely when Supabase is unconfigured so previews
 * without env vars stay clean.
 */
export async function UserMenu({ locale }: { locale: Locale }) {
  if (!isSupabaseConfigured()) return null;

  const t = await getTranslations({ locale, namespace: "Auth" });
  const user = await getCurrentUser();

  if (!user) {
    return <SignInSheet />;
  }

  const label = user.profile?.display_name ?? user.profile?.username ?? t("account");

  return (
    <Button asChild variant="ghost" size="sm" className="gap-2">
      <Link href="/account" locale={locale} aria-label={t("openAccount")}>
        {user.profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URLs may not be on the next/image allowlist.
          <img
            src={user.profile.avatar_url}
            alt=""
            className="size-6 rounded-full border border-border object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserRound className="size-4" aria-hidden="true" />
        )}
        <span className="max-w-[14ch] truncate">{label}</span>
      </Link>
    </Button>
  );
}
