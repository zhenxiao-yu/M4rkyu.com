import { ArrowUpRight, FolderPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDbGalleryCollections, getDbGalleryItems } from "@/lib/gallery/db";
import { AdminNav } from "../_components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const [collections, items] = await Promise.all([
    getDbGalleryCollections(),
    getDbGalleryItems(),
  ]);

  const countByCollection = new Map<string, number>();
  for (const item of items) {
    countByCollection.set(
      item.collectionId,
      (countByCollection.get(item.collectionId) ?? 0) + 1,
    );
  }

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="GALLERY"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t("collectionsCount", { count: collections.length })}
          </p>
          <Button asChild size="sm">
            <Link href="/admin/gallery/new" locale={locale}>
              <FolderPlus className="size-4" aria-hidden="true" />
              {t("newCollection")}
            </Link>
          </Button>
        </div>

        {collections.length === 0 ? (
          <Card className="bg-card/80">
            <CardContent className="grid gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("emptyTitle")}</p>
              <p className="text-xs text-muted-foreground/80">
                {t("emptyDescription")}
              </p>
              <div className="flex justify-center pt-1">
                <Button asChild size="sm">
                  <Link href="/admin/gallery/new" locale={locale}>
                    <FolderPlus className="size-4" aria-hidden="true" />
                    {t("newCollection")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card key={collection.id} className="flex h-full flex-col bg-card/80">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[0.6rem]">
                      {collection.status}
                    </Badge>
                    {collection.featured ? (
                      <Badge variant="success" className="font-mono text-[0.6rem]">
                        {t("featured")}
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className="ml-auto font-mono text-[0.6rem]">
                      {t("itemCount", {
                        count: countByCollection.get(collection.id) ?? 0,
                      })}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2 text-base">
                    {collection.title}
                  </CardTitle>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                    /{collection.slug}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {collection.description || t("noDescription")}
                  </p>
                  <div className="mt-auto flex justify-end">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/admin/gallery/${collection.slug}`}
                        locale={locale}
                      >
                        {t("manage")}
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
