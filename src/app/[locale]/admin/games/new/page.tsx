import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { GameForm } from "@/components/admin/games/game-form";
import { createGameAction } from "@/lib/games/admin";
import { buildGameFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewGamePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGames" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildGameFormLabels(locale);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("newGameTitle")}
        description={t("newGameDescription")}
        decorativeWord="NEW"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/games" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToGames")}
            </Link>
          </Button>
        </div>

        <GameForm
          action={createGameAction}
          labels={{ ...labels, submit: t("create") }}
          successMessage={tAdmin("saved")}
          cancelHref={`/${locale}/admin/games`}
        />
      </PageSection>
    </PageShell>
  );
}
