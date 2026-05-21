import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { NoteCard, type NoteCardLabels } from "@/components/notes/note-card";
import { getNotesSource } from "@/lib/notes/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";

// Public content via the cookieless read source + setRequestLocale →
// prerender statically, revalidate hourly (admin edits also bust the
// cache via revalidatePath).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("notesTitle"),
    description: tMeta("notesDescription"),
    alternates: buildAlternates(locale, "/notes"),
  };
}

export default async function NotesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNotes = await getTranslations({ locale, namespace: "Notes" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const notes = await getNotesSource();

  const labels: NoteCardLabels = {
    kind: {
      update: tNotes("kind.update"),
      repost: tNotes("kind.repost"),
      note: tNotes("kind.note"),
      review: tNotes("kind.review"),
      tierlist: tNotes("kind.tierlist"),
    },
    permalink: tNotes("permalink"),
    rating: (value: number) => tNotes("ratingLabel", { rating: value }),
    linkCta: tNotes("linkCta"),
  };

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tNotes("eyebrow")}
        title={tMeta("notesTitle")}
        description={tMeta("notesDescription")}
        decorativeWord="NOTES"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        {notes.length === 0 ? (
          <EmptyArchiveState
            title={tNotes("pendingTitle")}
            description={tNotes("pendingDescription")}
          />
        ) : (
          <div className="mx-auto grid max-w-2xl gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note.slug}
                note={note}
                locale={locale}
                labels={labels}
              />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
