import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { ProjectForm } from "@/components/admin/projects/project-form";
import { createProjectAction } from "@/lib/projects/admin";
import { buildProjectFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminProjects" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildProjectFormLabels(locale);

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("newProjectTitle")}
        description={t("newProjectDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/projects" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToProjects")}
            </Link>
          </Button>
        }
      />

      <ProjectForm
        action={createProjectAction}
        labels={{ ...labels, submit: t("create") }}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/projects`}
      />
    </>
  );
}
