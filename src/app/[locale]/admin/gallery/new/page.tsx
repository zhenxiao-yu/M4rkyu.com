import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { CollectionForm } from "@/components/admin/gallery/collection-form";
import { createCollectionAction } from "@/lib/gallery/admin";
import { buildCollectionFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildCollectionFormLabels(locale);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("newCollectionTitle")}
        description={t("newCollectionDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/gallery" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToCollections")}
            </Link>
          </Button>
        }
      />

      <CollectionForm
        action={createCollectionAction}
        labels={{ ...labels, submit: t("create") }}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/gallery`}
      />
    </>
  );
}
