import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDbGames } from "@/lib/games/db";
import { AdminNav } from "../_components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, gameList] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGames" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbGames(),
  ]);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="PLAY"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t("count", { count: gameList.length })}
          </p>
          <Button asChild size="sm">
            <Link href="/admin/games/new" locale={locale}>
              <Plus className="size-4" aria-hidden="true" />
              {t("newGame")}
            </Link>
          </Button>
        </div>

        {gameList.length === 0 ? (
          <Card className="bg-card/80">
            <CardContent className="grid gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("emptyTitle")}</p>
              <p className="text-xs text-muted-foreground/80">
                {t("emptyDescription")}
              </p>
              <div className="flex justify-center pt-1">
                <Button asChild size="sm">
                  <Link href="/admin/games/new" locale={locale}>
                    <Plus className="size-4" aria-hidden="true" />
                    {t("newGame")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {gameList.map((game) => (
              <li key={game.id}>
                <Card className="bg-card/80">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="grid gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-[0.6rem]"
                        >
                          {game.engine}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-[0.6rem]"
                        >
                          {game.year}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="font-mono text-[0.6rem]"
                        >
                          {game.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{game.title}</CardTitle>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                        /{game.slug}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/games/${game.slug}`}
                        locale={locale}
                      >
                        {t("edit")}
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground">
                    <p className="line-clamp-2">{game.pitch || t("noPitch")}</p>
                    {game.platforms && game.platforms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {game.platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className="font-mono text-[0.6rem]"
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </PageShell>
  );
}
