import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbCollectionBySlug,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import {
  createItemAction,
  deleteCollectionAction,
  deleteItemAction,
  updateCollectionAction,
} from "@/lib/gallery/admin";
import { DeleteButton } from "@/components/admin/delete-button";
import { CollectionForm } from "@/components/admin/gallery/collection-form";
import { ItemForm } from "@/components/admin/gallery/item-form";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { buildCollectionFormLabels, buildItemFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  // Fan out: both translation namespaces, the collection row, the items
  // list, and the form label bags can all be requested in parallel.
  const [t, tAdmin, collection, allItems, collectionLabels, itemLabels] =
    await Promise.all([
      getTranslations({ locale, namespace: "AdminGallery" }),
      getTranslations({ locale, namespace: "Admin" }),
      getDbCollectionBySlug(slug),
      getDbGalleryItems(),
      buildCollectionFormLabels(locale),
      buildItemFormLabels(locale),
    ]);
  if (!collection) notFound();

  const items = allItems.filter((item) => item.collectionId === collection.id);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={collection.title}
        description={collection.description || t("noDescription")}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/gallery" locale={locale}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t("backToCollections")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/${locale}/archive/${collection.slug}`}
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

      <div className="grid gap-8 xl:grid-cols-[1fr_24rem]">
          {/* Items grid */}
          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {t("itemsHeading", { count: items.length })}
              </h2>
            </div>

            {items.length === 0 ? (
              <Card className="bg-card/80">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  {t("noItems")}
                </CardContent>
              </Card>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => {
                  const src = storageUrlFor(item.storagePath);
                  return (
                    <li key={item.id}>
                      <Card className="bg-card/80">
                        <CardHeader className="pb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-mono text-[0.6rem]">
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className="font-mono text-[0.6rem]">
                              {item.type}
                            </Badge>
                            {item.featured ? (
                              <Badge variant="success" className="font-mono text-[0.6rem]">
                                {t("featured")}
                              </Badge>
                            ) : null}
                          </div>
                          <CardTitle className="mt-1 text-sm">
                            {item.title}
                          </CardTitle>
                          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                            /{item.slug}
                          </p>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                          {src ? (
                            <div className="relative aspect-4/5 overflow-hidden rounded-md border border-border/60">
                              <Image
                                src={src}
                                alt={item.alt || item.title}
                                fill
                                sizes="(min-width: 640px) 280px, 100vw"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid aspect-4/5 place-items-center rounded-md border border-dashed border-border/60 bg-muted/30 text-center text-xs text-muted-foreground">
                              {t("noImage")}
                            </div>
                          )}
                          <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {item.caption || t("noCaption")}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Link
                                href={`/admin/gallery/${collection.slug}/${item.slug}`}
                                locale={locale}
                              >
                                {t("editItem")}
                              </Link>
                            </Button>
                            <form action={deleteItemAction} className="flex-1">
                              <input type="hidden" name="id" value={item.id} />
                              <DeleteButton
                                variant="outline"
                                size="sm"
                                className="w-full text-destructive hover:text-destructive"
                                confirmMessage={t("deleteItemConfirm", {
                                  title: item.title,
                                })}
                              >
                                {t("deleteItem")}
                              </DeleteButton>
                            </form>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Right rail: collection edit + add-item form + danger zone */}
          <aside className="grid gap-4">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">{t("collectionForm")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CollectionForm
                  action={updateCollectionAction}
                  collection={collection}
                  labels={{ ...collectionLabels, submit: t("save") }}
                  successMessage={tAdmin("saved")}
                  hiddenFields={
                    <input type="hidden" name="id" value={collection.id} />
                  }
                  cancelHref={`/${locale}/admin/gallery`}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle className="text-base">{t("newItem")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ItemForm
                  action={createItemAction}
                  collectionId={collection.id}
                  showImage
                  labels={{ ...itemLabels, submit: t("addItem") }}
                  successMessage={tAdmin("saved")}
                  cancelHref={`/${locale}/admin/gallery/${collection.slug}`}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  {t("dangerZone")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={deleteCollectionAction}>
                  <input type="hidden" name="id" value={collection.id} />
                  <DeleteButton
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    confirmMessage={t("deleteCollectionConfirm", {
                      title: collection.title,
                    })}
                  >
                    {t("deleteCollection")}
                  </DeleteButton>
                  <p className="mt-2 text-[0.7rem] text-muted-foreground">
                    {t("deleteWarning")}
                  </p>
                </form>
              </CardContent>
            </Card>
          </aside>
      </div>
    </>
  );
}
