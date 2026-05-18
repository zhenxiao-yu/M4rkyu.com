import { getTranslations } from "next-intl/server";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SignInSheet } from "./sign-in-sheet";
import type { Locale } from "@/i18n/routing";

/**
 * Server component. Renders either:
 *  - the SignInSheet trigger (guest), or
 *  - a link to /account with the user's display name + a small avatar
 *    (signed-in).
 *
 * Keeps the guest sign-in trigger visible even when Supabase is
 * unconfigured. The form actions surface the "auth unavailable"
 * state, which is clearer than silently removing the auth UI.
 */
export async function UserMenu({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Auth" });
  const user = await getCurrentUser();

  if (!user) {
    return <SignInSheet />;
  }

  const label =
    user.profile?.display_name ?? user.profile?.username ?? t("account");

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
        <span className="hidden max-w-[14ch] truncate min-[380px]:inline">
          {label}
        </span>
      </Link>
    </Button>
  );
}
