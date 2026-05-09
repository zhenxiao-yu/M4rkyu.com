import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export interface CaseStudyAdjacentEntry {
  href: string;
  title: string;
  pitch: string;
}

interface CaseStudyFooterProps {
  prev?: CaseStudyAdjacentEntry;
  next?: CaseStudyAdjacentEntry;
  archiveHref: string;
}

/**
 * Shared editorial footer for case-study-style detail pages
 * (projects, games). Consumer formats the prev/next entries from
 * its own data shape — the footer is route-agnostic.
 */
export async function CaseStudyFooter({
  prev,
  next,
  archiveHref,
}: CaseStudyFooterProps) {
  const t = await getTranslations("CaseStudy");

  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <CaseStudyAdjacent
            entry={prev}
            direction="prev"
            label={t("previous")}
          />
          <div className="hidden lg:block lg:self-center">
            <Button asChild variant="outline">
              <Link href={archiveHref}>{t("backToArchive")}</Link>
            </Button>
          </div>
          <CaseStudyAdjacent
            entry={next}
            direction="next"
            label={t("next")}
          />
        </div>
        <div className="mt-8 flex justify-center lg:hidden">
          <Button asChild variant="outline">
            <Link href={archiveHref}>{t("backToArchive")}</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}

function CaseStudyAdjacent({
  entry,
  direction,
  label,
}: {
  entry: CaseStudyAdjacentEntry | undefined;
  direction: "prev" | "next";
  label: string;
}) {
  if (!entry) {
    return <div className="hidden lg:block" aria-hidden="true" />;
  }

  const isNext = direction === "next";

  return (
    <Link
      href={entry.href}
      className={`group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        isNext ? "lg:text-right" : ""
      }`}
    >
      <span
        className={`flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground ${
          isNext ? "lg:justify-end" : ""
        }`}
      >
        {!isNext ? <ArrowLeft aria-hidden="true" className="size-3" /> : null}
        {label}
        {isNext ? <ArrowRight aria-hidden="true" className="size-3" /> : null}
      </span>
      <span className="text-lg font-semibold leading-snug">{entry.title}</span>
      <span className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {entry.pitch}
      </span>
    </Link>
  );
}
