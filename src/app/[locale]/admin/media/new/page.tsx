import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { MediaForm } from "@/components/admin/media/media-form";
import { createMediaAction } from "@/lib/media/admin";
import { buildMediaFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewMediaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminMedia" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildMediaFormLabels(locale);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("newMediaTitle")}
        description={t("newMediaDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/media" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToMedia")}
            </Link>
          </Button>
        }
      />

      <MediaForm
        action={createMediaAction}
        labels={{ ...labels, submit: t("create") }}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/media`}
      />
    </>
  );
}
