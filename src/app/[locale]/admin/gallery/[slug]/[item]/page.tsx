import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbCollectionBySlug,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import { updateItemAction } from "@/lib/gallery/admin";
import { ItemForm } from "@/components/admin/gallery/item-form";
import { AdminPageHeader } from "../../../_components/admin-page-header";
import { buildItemFormLabels } from "../../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string; item: string }>;
}

export default async function EditItemPage({ params }: PageProps) {
  const { locale, slug, item: itemSlug } = await params;
  const [t, tAdmin, collection, allItems, itemLabels] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGallery" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbCollectionBySlug(slug),
    getDbGalleryItems(),
    buildItemFormLabels(locale),
  ]);
  if (!collection) notFound();

  const item = allItems.find(
    (row) => row.collectionId === collection.id && row.slug === itemSlug,
  );
  if (!item) notFound();

  const currentImageUrl = storageUrlFor(item.storagePath);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("editItemTitle")}
        description={t("editItemDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/gallery/${collection.slug}`} locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToCollection")}
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-2xl">
          <ItemForm
            action={updateItemAction}
            item={item}
            collectionId={collection.id}
            showImage={false}
            currentImageUrl={currentImageUrl}
            labels={{ ...itemLabels, submit: t("save") }}
            successMessage={tAdmin("saved")}
            hiddenFields={<input type="hidden" name="id" value={item.id} />}
            cancelHref={`/${locale}/admin/gallery/${collection.slug}`}
          />
      </div>
    </>
  );
}
