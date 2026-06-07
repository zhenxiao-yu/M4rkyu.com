import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
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
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("newGameTitle")}
        description={t("newGameDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/games" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToGames")}
            </Link>
          </Button>
        }
      />

      <GameForm
        action={createGameAction}
        labels={{ ...labels, submit: t("create") }}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/games`}
      />
    </>
  );
}
