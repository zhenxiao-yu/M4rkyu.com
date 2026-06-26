import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminPageHeader } from "../_components/admin-page-header";
import { importAllAction } from "@/lib/admin/import/run";

export const dynamic = "force-dynamic";

export default async function AdminImportPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminImport" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("back")}
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        <AdminForm
          action={importAllAction}
          submitLabel={t("runLabel")}
          cancelLabel={t("back")}
          cancelHref={`/${locale}/admin`}
          successMessage={tAdmin("saved")}
        >
          <label className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 text-sm">
            <input
              type="checkbox"
              name="dryRun"
              value="true"
              defaultChecked
              className="size-4 shrink-0"
            />
            {t("dryRunLabel")}
          </label>
          <p className="text-[0.8rem] text-muted-foreground">{t("note")}</p>
        </AdminForm>
      </div>
    </>
  );
}
