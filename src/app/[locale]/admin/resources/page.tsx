import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import type { Locale } from "@/i18n/routing";
import { getDbResources } from "@/lib/resources/db";
import {
  duplicateResourceAction,
  reorderResourceAction,
  setResourceStatusAction,
} from "@/lib/resources/admin";
import { AdminNav } from "../_components/admin-nav";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, resources] = await Promise.all([
    getTranslations({ locale, namespace: "AdminResources" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbResources(),
  ]);

  const items: AdminListItem[] = resources.map((resource) => ({
    id: resource.id,
    slug: resource.slug,
    title: resource.name,
    status: resource.status,
    badges: [resource.category, resource.type].filter(Boolean),
    subtitle: resource.description || undefined,
    viewHref:
      resource.type === "tool"
        ? `/${locale}/resources/${resource.slug}`
        : resource.link,
  }));

  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="RESOURCES"
      />
      <PageSection>
        <AdminNav locale={locale} />
        <AdminList
          items={items}
          locale={locale}
          editBase="/admin/resources"
          newHref="/admin/resources/new"
          statusOptions={statusOptions}
          setStatusAction={setResourceStatusAction}
          reorderAction={reorderResourceAction}
          duplicateAction={duplicateResourceAction}
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
            newLabel: t("newResource"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
      </PageSection>
    </PageShell>
  );
}
