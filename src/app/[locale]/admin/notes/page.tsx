import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import type { Locale } from "@/i18n/routing";
import { getDbNotes } from "@/lib/notes/db";
import {
  duplicateNoteAction,
  reorderNoteAction,
  setNoteStatusAction,
} from "@/lib/notes/admin";
import { AdminNav } from "../_components/admin-nav";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminNotesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, notes] = await Promise.all([
    getTranslations({ locale, namespace: "AdminNotes" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbNotes(),
  ]);

  const items: AdminListItem[] = notes.map((note) => {
    const fallback = note.body.replace(/\s+/g, " ").trim().slice(0, 60);
    return {
      id: note.id,
      slug: note.slug,
      title: note.title || fallback || note.slug,
      status: note.status,
      badges: [t(`kind.${note.kind}`)],
      subtitle: note.published_at.slice(0, 10),
      viewHref:
        note.status === "ready"
          ? `/${locale}/notes#${note.slug}`
          : undefined,
    };
  });

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
        decorativeWord="NOTES"
      />
      <PageSection>
        <AdminNav locale={locale} />
        <AdminList
          items={items}
          locale={locale}
          editBase="/admin/notes"
          newHref="/admin/notes/new"
          statusOptions={statusOptions}
          setStatusAction={setNoteStatusAction}
          reorderAction={reorderNoteAction}
          duplicateAction={duplicateNoteAction}
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
            newLabel: t("newNote"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
      </PageSection>
    </PageShell>
  );
}
