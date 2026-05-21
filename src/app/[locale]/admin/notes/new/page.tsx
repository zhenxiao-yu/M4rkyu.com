import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "../../_components/admin-nav";
import { NoteForm } from "@/components/admin/notes/note-form";
import { createNoteAction } from "@/lib/notes/admin";
import { buildNoteFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

export default async function NewNotePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminNotes" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });
  const labels = await buildNoteFormLabels(locale);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("newNoteTitle")}
        description={t("newNoteDescription")}
        decorativeWord="NEW"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3 h-auto px-3">
            <Link href="/admin/notes" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToNotes")}
            </Link>
          </Button>
        </div>

        <NoteForm
          action={createNoteAction}
          labels={{ ...labels, submit: t("create") }}
          successMessage={tAdmin("saved")}
          cancelHref={`/${locale}/admin/notes`}
        />
      </PageSection>
    </PageShell>
  );
}
