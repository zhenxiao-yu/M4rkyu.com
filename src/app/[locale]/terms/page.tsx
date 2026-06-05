import type { Metadata } from "next";
import { ArrowUpRight, Mail } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Link } from "@/i18n/navigation";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";

export const dynamic = "force-static";
export const revalidate = 3600;

// Fixed reading order. Each id maps to Terms.s.<id>.{h,p}; a few append
// a live link (source repo, the privacy page, the contact mailto) sourced
// from `profile` so they never drift from the single source of truth.
const SECTIONS = [
  "use",
  "ip",
  "comments",
  "ai",
  "links",
  "warranty",
  "liability",
  "privacy",
  "law",
  "changes",
  "contact",
] as const;

const linkClass =
  "mt-3 inline-flex items-center gap-2 rounded-md font-mono text-xs uppercase tracking-[0.16em] text-foreground transition-colors hover:text-ring";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("termsTitle"),
    description: tMeta("termsDescription"),
    alternates: buildAlternates(locale, "/terms"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Terms" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const githubHref = profile.socials?.github ?? "https://github.com/zhenxiao-yu";

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("termsTitle")}
        description={tMeta("termsDescription")}
        decorativeWord="TERMS"
      />
      <PageSection innerClassName="py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("updated")} · {t("updatedDate")}
          </p>
          <p className="mt-5 text-base leading-7 text-foreground/85">
            {t("intro")}
          </p>

          <div className="mt-10 flex flex-col gap-9">
            {SECTIONS.map((id, index) => (
              <section key={id} aria-labelledby={`terms-${id}`}>
                <h2
                  id={`terms-${id}`}
                  className="flex items-baseline gap-3 font-heading text-xl font-semibold tracking-tight"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs tabular-nums text-ring/70"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t(`s.${id}.h`)}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {t(`s.${id}.p`)}
                </p>

                {id === "ip" ? (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(linkClass, FOCUS_RING)}
                  >
                    MIT License · GitHub
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </a>
                ) : null}

                {id === "privacy" ? (
                  <Link
                    href="/privacy"
                    locale={locale}
                    className={cn(linkClass, FOCUS_RING)}
                  >
                    {tMeta("privacyTitle")}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                ) : null}

                {id === "contact" ? (
                  <a
                    href={`mailto:${profile.email}`}
                    className={cn(linkClass, FOCUS_RING)}
                  >
                    <Mail aria-hidden="true" className="size-3.5" />
                    {profile.email}
                  </a>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </PageSection>
    </PageShell>
  );
}
