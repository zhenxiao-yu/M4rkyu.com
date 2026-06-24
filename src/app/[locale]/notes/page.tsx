import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { Link } from "@/i18n/navigation";
import {
  NotesTimeline,
  type NotesTimelineLabels,
} from "@/components/notes/notes-timeline";
import { getNotesSource } from "@/lib/notes/source";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildBlogJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import { cn, FOCUS_RING } from "@/lib/utils";

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
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);
  const tNotes = await getTranslations({ locale, namespace: "Notes" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const notes = await getNotesSource();
  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags))).sort(
    (a, b) => a.localeCompare(b),
  );
  const activeTag = tag && allTags.includes(tag) ? tag : undefined;
  const visibleNotes = activeTag
    ? notes.filter((note) => note.tags.includes(activeTag))
    : notes;

  const labels: NotesTimelineLabels = {
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
    latest: tNotes("latest"),
  };

  return (
    <PageShell locale={locale}>
      <JsonLd
        data={buildBlogJsonLd(locale, {
          name: tMeta("notesTitle"),
          description: tMeta("notesDescription"),
          path: "/notes",
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "/" },
          { name: tNav("notes"), path: "/notes" },
        ])}
      />
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {tNotes("eyebrow")}
          </p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {tMeta("notesTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {tMeta("notesDescription")}
          </p>
        </div>
      </header>

      <main className="bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          {notes.length === 0 ? (
            <EmptyArchiveState
              title={tNotes("pendingTitle")}
              description={tNotes("pendingDescription")}
            />
          ) : (
            <div className="grid gap-10">
              <nav
                aria-label={tNotes("tagFilterLabel")}
                className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border/70 pb-4"
              >
                <TagLink
                  href="/notes"
                  locale={locale}
                  active={!activeTag}
                  label={tNotes("allTags")}
                />
                {allTags.map((noteTag) => (
                  <TagLink
                    key={noteTag}
                    href={`/notes?tag=${encodeURIComponent(noteTag)}`}
                    locale={locale}
                    active={noteTag === activeTag}
                    label={`#${noteTag}`}
                  />
                ))}
              </nav>
              {visibleNotes.length === 0 ? (
                <EmptyArchiveState
                  title={tNotes("noTagResultsTitle")}
                  description={tNotes("noTagResultsDescription")}
                />
              ) : (
                <NotesTimeline
                  notes={visibleNotes}
                  locale={locale}
                  labels={labels}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </PageShell>
  );
}

function TagLink({
  href,
  locale,
  active,
  label,
}: {
  href: string;
  locale: Locale;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-colors duration-(--motion-fast) ease-(--ease-premium)",
        active
          ? "border-ring text-foreground"
          : "border-transparent text-muted-foreground hover:border-ring/50 hover:text-foreground",
        FOCUS_RING,
      )}
    >
      {label}
    </Link>
  );
}
