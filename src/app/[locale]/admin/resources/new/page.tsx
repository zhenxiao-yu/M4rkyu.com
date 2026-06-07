import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { ResourceForm } from "@/components/admin/resources/resource-form";
import { createResourceAction } from "@/lib/resources/admin";
import { buildResourceFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminResources" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildResourceFormLabels(locale);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("newResourceTitle")}
        description={t("newResourceDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/resources" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToResources")}
            </Link>
          </Button>
        }
      />

      <ResourceForm
        action={createResourceAction}
        labels={{ ...labels, submit: t("create") }}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/resources`}
      />
    </>
  );
}
