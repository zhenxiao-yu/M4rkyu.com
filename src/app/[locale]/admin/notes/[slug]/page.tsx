import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { NoteForm } from "@/components/admin/notes/note-form";
import { deleteNoteAction, updateNoteAction } from "@/lib/notes/admin";
import { dbNoteRowToNote, getDbNoteBySlug } from "@/lib/notes/db";
import { DeleteButton } from "@/components/admin/delete-button";
import { buildNoteFormLabels } from "../_labels";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function EditNotePage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "AdminNotes" });
  const tAdmin = await getTranslations({ locale, namespace: "Admin" });

  const row = await getDbNoteBySlug(slug);
  if (!row) notFound();

  const note = dbNoteRowToNote(row);
  const labels = await buildNoteFormLabels(locale);
  const headingTitle =
    note.title || note.body.replace(/\s+/g, " ").trim().slice(0, 60) || note.slug;

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={headingTitle}
        description={t("editNoteDescription")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/notes" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToNotes")}
            </Link>
          </Button>
        }
      />

      <NoteForm
          action={updateNoteAction}
          note={{ ...note, id: row.id, sortOrder: row.sort_order }}
          labels={{ ...labels, submit: t("save") }}
          successMessage={tAdmin("saved")}
          hiddenFields={<input type="hidden" name="id" value={row.id} />}
          cancelHref={`/${locale}/admin/notes`}
        />

        <Card className="mt-8 max-w-2xl border-destructive/30 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              {t("dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={deleteNoteAction}>
              <input type="hidden" name="id" value={row.id} />
              <DeleteButton
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                confirmMessage={t("deleteNoteConfirm", { title: headingTitle })}
              >
                {t("deleteNote")}
              </DeleteButton>
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                {t("deleteWarning")}
              </p>
            </form>
          </CardContent>
        </Card>
    </>
  );
}
