import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
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
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("newProjectTitle")}
        description={t("newProjectDescription")}
        decorativeWord="NEW"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/projects" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToProjects")}
            </Link>
          </Button>
        </div>

        <ProjectForm
          action={createProjectAction}
          labels={{ ...labels, submit: t("create") }}
          successMessage={tAdmin("saved")}
          cancelHref={`/${locale}/admin/projects`}
        />
      </PageSection>
    </PageShell>
  );
}
