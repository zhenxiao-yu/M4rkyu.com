import { GitBranch } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDbProjects } from "@/lib/projects/db";
import {
  bulkDeleteProjectsAction,
  bulkSetProjectStatusAction,
  duplicateProjectAction,
  reorderProjectAction,
  setProjectStatusAction,
} from "@/lib/projects/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
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
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/projects/sync" locale={locale}>
              <GitBranch aria-hidden="true" className="size-4" />
              {t("syncCta")}
            </Link>
          </Button>
        }
      />
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
    </>
  );
}
