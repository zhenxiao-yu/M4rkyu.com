import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth/require-user";
import type { Locale } from "@/i18n/routing";
import { AccountNav } from "./_components/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="ACCOUNT"
      />
      <PageSection>
        <AccountNav locale={locale} />
        <Card className="bg-card/80">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar host is not in next/image allowlist
                <img
                  src={user.profile.avatar_url}
                  alt=""
                  className="size-12 rounded-full border border-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-12 place-items-center rounded-full border border-border bg-muted text-base font-semibold"
                >
                  {(user.profile?.display_name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <CardTitle className="text-lg leading-tight">
                  {user.profile?.display_name ?? user.profile?.username ?? t("anonymous")}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.email ?? ""}
                </p>
              </div>
            </div>
            <SignOutButton locale={locale} />
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {user.profile?.bio ? (
              <p className="text-muted-foreground">{user.profile.bio}</p>
            ) : (
              <p className="text-muted-foreground">{t("noBio")}</p>
            )}
            <div className="grid gap-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <span>
                {t("memberSince")} ·{" "}
                {user.profile?.created_at
                  ? new Date(user.profile.created_at).toISOString().slice(0, 10)
                  : "—"}
              </span>
              {user.identities.length > 0 ? (
                <span>
                  {t("signInMethods")} ·{" "}
                  {user.identities
                    .map((row) => providerLabel(row.provider))
                    .join(" · ")}
                </span>
              ) : null}
              {user.isAdmin ? <span>{t("adminBadge")}</span> : null}
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}

// Provider strings come straight out of Supabase (`google`, `github`,
// `email`, possibly future ones). We display them tidied — anything
// we don't recognise renders verbatim with the first letter cased.
function providerLabel(provider: string): string {
  switch (provider) {
    case "google":
      return "Google";
    case "github":
      return "GitHub";
    case "email":
      return "Email";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
