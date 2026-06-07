import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { GameForm } from "@/components/admin/games/game-form";
import { deleteGameAction, updateGameAction } from "@/lib/games/admin";
import { dbGameRowToGame, getDbGameBySlug } from "@/lib/games/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { buildGameFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGames" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const row = await getDbGameBySlug(slug);
  if (!row) notFound();

  const game = dbGameRowToGame(row);
  const labels = await buildGameFormLabels(locale);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={game.title}
        description={game.pitch || t("editGameDescription")}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/games" locale={locale}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t("backToGames")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/${locale}/games/${row.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                {tAdmin("list.view")}
              </a>
            </Button>
          </>
        }
      />

      <GameForm
        action={updateGameAction}
        game={{ ...game, id: row.id, sortOrder: row.sort_order }}
        labels={{ ...labels, submit: t("save") }}
        successMessage={tAdmin("saved")}
        hiddenFields={<input type="hidden" name="id" value={row.id} />}
        cancelHref={`/${locale}/admin/games`}
      />

      <Card className="mt-8 max-w-2xl border-destructive/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              {t("dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deleteGameAction}>
              <input type="hidden" name="id" value={row.id} />
              <DeleteButton
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                confirmMessage={t("deleteGameConfirm", {
                  title: game.title,
                })}
              >
                {t("deleteGame")}
              </DeleteButton>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                {t("deleteWarning")}
              </p>
            </form>
          </CardContent>
        </Card>
    </>
  );
}
