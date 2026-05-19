import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getSavedItems } from "@/lib/social/saves";
import { lookupContent } from "@/lib/content/lookup";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { AccountNav } from "../_components/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountSavedPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });

  const items = await getSavedItems();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("savedTitle")}
        description={t("savedDescription")}
        decorativeWord="SAVED"
      />
      <PageSection>
        <AccountNav locale={locale} />

        {items.length === 0 ? (
          <Card className="bg-card/80">
            <CardContent className="py-12 text-center">
              <p className="text-base text-muted-foreground">{t("savedEmpty")}</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {items.map((item) => {
              const summary = lookupContent(item.item_type, item.item_key);
              const key = `${item.item_type}:${item.item_key}`;
              if (!summary) {
                return (
                  <li key={key}>
                    <Card className="bg-card/40">
                      <CardContent className="flex items-center justify-between gap-4 py-4">
                        <div>
                          <p className="text-sm text-muted-foreground line-through">
                            {item.item_key}
                          </p>
                          <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                            {t("tombstone")}
                          </p>
                        </div>
                        <Badge variant="outline">{item.item_type}</Badge>
                      </CardContent>
                    </Card>
                  </li>
                );
              }
              const cardBody = (
                <Card className="bg-card/80 group-hover:border-ring group-hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium leading-tight">
                        {summary.title}
                      </p>
                      {summary.subtitle ? (
                        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {summary.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline">{item.item_type}</Badge>
                  </CardContent>
                </Card>
              );
              return (
                <li key={key}>
                  {summary.external ? (
                    <a
                      href={summary.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group block rounded-md",
                        FOCUS_RING_INSET,
                      )}
                    >
                      {cardBody}
                    </a>
                  ) : (
                    <Link
                      href={summary.href}
                      locale={locale}
                      className={cn(
                        "group block rounded-md",
                        FOCUS_RING_INSET,
                      )}
                    >
                      {cardBody}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </PageSection>
    </PageShell>
  );
}
