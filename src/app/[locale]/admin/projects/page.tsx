import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import type { Locale } from "@/i18n/routing";
import { getDbProjects } from "@/lib/projects/db";
import {
  bulkDeleteProjectsAction,
  bulkSetProjectStatusAction,
  duplicateProjectAction,
  reorderProjectAction,
  setProjectStatusAction,
} from "@/lib/projects/admin";
import { AdminNav } from "../_components/admin-nav";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, projects] = await Promise.all([
    getTranslations({ locale, namespace: "AdminProjects" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbProjects(),
  ]);

  const items: AdminListItem[] = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    status: project.content_status,
    badges: [project.category, project.year].filter(Boolean),
    subtitle: project.short_pitch || undefined,
    viewHref: `/${locale}/work/${project.slug}`,
  }));

  const statusOptions = [
    { value: "ready", label: t("contentStatus.ready") },
    { value: "draft", label: t("contentStatus.draft") },
    { value: "placeholder", label: t("contentStatus.placeholder") },
    { value: "coming-soon", label: t("contentStatus.comingSoon") },
  ];

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="WORK"
      />
      <PageSection>
        <AdminNav locale={locale} />
        <AdminList
          items={items}
          locale={locale}
          editBase="/admin/projects"
          newHref="/admin/projects/new"
          statusOptions={statusOptions}
          setStatusAction={setProjectStatusAction}
          reorderAction={reorderProjectAction}
          duplicateAction={duplicateProjectAction}
          bulkStatusAction={bulkSetProjectStatusAction}
          bulkDeleteAction={bulkDeleteProjectsAction}
          labels={{
            searchPlaceholder: tAdmin("list.search"),
            statusAll: tAdmin("list.allStatuses"),
            edit: t("edit"),
            view: tAdmin("list.view"),
            duplicate: tAdmin("list.duplicate"),
            moveUp: tAdmin("list.moveUp"),
            moveDown: tAdmin("list.moveDown"),
            statusAria: tAdmin("list.status"),
            noMatches: tAdmin("list.noMatches"),
            results: tAdmin("list.results"),
            newLabel: t("newProject"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
      </PageSection>
    </PageShell>
  );
}
