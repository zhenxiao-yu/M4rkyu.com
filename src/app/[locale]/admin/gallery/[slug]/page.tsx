import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbCollectionBySlug,
  getDbGalleryCollections,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import {
  bulkDeleteItemsAction,
  bulkSetItemStatusAction,
  createItemAction,
  deleteCollectionAction,
  moveItemsAction,
  reorderItemAction,
  setItemFeaturedAction,
  setItemStatusAction,
  updateCollectionAction,
} from "@/lib/gallery/admin";
import { DeleteButton } from "@/components/admin/delete-button";
import { CollectionForm } from "@/components/admin/gallery/collection-form";
import { ItemForm } from "@/components/admin/gallery/item-form";
import {
  CollectionItemsManager,
  type GalleryManagerItem,
} from "@/components/admin/gallery/collection-items-manager";
import { BatchUploadDropzone } from "@/components/admin/gallery/batch-upload-dropzone";
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
  const [
    t,
    tAdmin,
    collection,
    allItems,
    allCollections,
    collectionLabels,
    itemLabels,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGallery" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbCollectionBySlug(slug),
    getDbGalleryItems(),
    getDbGalleryCollections(),
    buildCollectionFormLabels(locale),
    buildItemFormLabels(locale),
  ]);
  if (!collection) notFound();

  const items = allItems.filter((item) => item.collectionId === collection.id);
  const managerItems: GalleryManagerItem[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    type: item.type,
    featured: item.featured,
    alt: item.alt,
    caption: item.caption,
    imageUrl: storageUrlFor(item.storagePath),
  }));
  const otherCollections = allCollections
    .filter((c) => c.id !== collection.id)
    .map((c) => ({ id: c.id, title: c.title }));
  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];

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
          {/* Photo manager — multi-select grid: move between collections,
            * bulk status/delete, featured toggle, drag-reorder. */}
          <section className="grid gap-4">
            <Card className="bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("batch.heading")}</CardTitle>
              </CardHeader>
              <CardContent>
                <BatchUploadDropzone
                  collectionId={collection.id}
                  collectionSlug={collection.slug}
                />
              </CardContent>
            </Card>

            <CollectionItemsManager
              items={managerItems}
              collections={otherCollections}
              collectionSlug={collection.slug}
              locale={locale}
              statusOptions={statusOptions}
              setStatusAction={setItemStatusAction}
              setFeaturedAction={setItemFeaturedAction}
              reorderAction={reorderItemAction}
              bulkStatusAction={bulkSetItemStatusAction}
              bulkDeleteAction={bulkDeleteItemsAction}
              moveAction={moveItemsAction}
            />
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
